from __future__ import annotations

from typing import List

import os
import shutil
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.data.fetcher import fetch_price_history, fetch_single_price_series
from backend.data.preprocessor import build_portfolio_returns, compute_returns, normalize_weights
# Load .env file manually if python-dotenv is not installed
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

from backend.risk.beta import beta_alpha
from backend.risk.correlation import correlation_matrix
from backend.risk.sharpe import sharpe_ratio
from backend.risk.var import historical_var, monte_carlo_var, parametric_var_cvar
from backend.data.scraper import extract_text_from_image, parse_ocr_text_to_portfolio


class Holding(BaseModel):
    ticker: str = Field(..., min_length=1)
    weight: float = Field(..., gt=0)


class PortfolioRequest(BaseModel):
    holdings: List[Holding] = Field(..., min_length=1)
    benchmark: str = "^NSEI"
    period: str = "2y"
    interval: str = "1d"
    confidence: float = Field(0.95, gt=0, lt=1)
    risk_free_rate: float = 0.065
    horizon_days: int = Field(10, gt=0)
    simulations: int = Field(5000, gt=0, le=50000)
    seed: int | None = None


app = FastAPI(title="Stock Portfolio Risk Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    # Ensure temp directory exists
    os.makedirs("temp", exist_ok=True)
    path = f"temp/{file.filename}"
    
    try:
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Extract raw text from image
        ocr_text = extract_text_from_image(path)
        
        # 2. Parse text into structured portfolio JSON using LLM
        portfolio_data = parse_ocr_text_to_portfolio(ocr_text)
        
        return portfolio_data
        
    except ImportError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(exc)}")
    finally:
        # Clean up temp file
        if os.path.exists(path):
            os.remove(path)


@app.post("/api/analyze")
def analyze_portfolio(payload: PortfolioRequest) -> dict:
    try:
        tickers = [item.ticker for item in payload.holdings]
        weights = normalize_weights([item.weight for item in payload.holdings])

        prices = fetch_price_history(
            tickers=tickers,
            period=payload.period,
            interval=payload.interval,
            add_ns_suffix=True,
        )
        asset_returns = compute_returns(prices, method="simple")
        portfolio_returns = build_portfolio_returns(asset_returns, weights)

        benchmark_prices = fetch_single_price_series(
            ticker=payload.benchmark,
            period=payload.period,
            interval=payload.interval,
            add_ns_suffix=False,
        )
        benchmark_returns = compute_returns(benchmark_prices.to_frame("benchmark"), method="simple").iloc[:, 0]

        h_var = historical_var(portfolio_returns, confidence=payload.confidence)
        p_var, p_cvar = parametric_var_cvar(portfolio_returns, confidence=payload.confidence)
        mc_var = monte_carlo_var(
            portfolio_returns,
            confidence=payload.confidence,
            n_sims=payload.simulations,
            horizon_days=payload.horizon_days,
            seed=payload.seed,
        )
        sharpe = sharpe_ratio(portfolio_returns, risk_free_rate=payload.risk_free_rate)
        beta_info = beta_alpha(
            portfolio_returns,
            benchmark_returns,
            risk_free_rate=payload.risk_free_rate,
        )
        corr = correlation_matrix(asset_returns)

        return {
            "metrics": {
                "historical_var": h_var,
                "parametric_var": p_var,
                "parametric_cvar": p_cvar,
                "monte_carlo_var": mc_var,
                "sharpe_ratio": sharpe,
                "beta": beta_info["beta"],
                "alpha_annual": beta_info["alpha_annual"],
                "r_squared": beta_info["r_squared"],
                "observations": beta_info["observations"],
            },
            "correlation_matrix": corr.round(4).to_dict(),
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
