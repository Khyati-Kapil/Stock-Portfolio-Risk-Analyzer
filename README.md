# Stock Portfolio Risk Analyzer (MVP)

Minimal desktop-backend project for portfolio risk analytics using Python + FastAPI.

## What It Does

- Accepts portfolio holdings (ticker + weight)
- Fetches historical prices from Yahoo Finance (`yfinance`)
- Computes core risk metrics:
  - Historical VaR
  - Parametric VaR / CVaR
  - Monte Carlo VaR
  - Sharpe Ratio
  - Beta / Alpha / R-squared (vs benchmark)
  - Correlation matrix

## Current Backend Structure

```text
backend/
  main.py
  data/
    fetcher.py
    preprocessor.py
  risk/
    var.py
    sharpe.py
    beta.py
    correlation.py
tests/
  test_risk_metrics.py
  test_api_smoke.py
requirements.txt
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run Backend

```bash
uvicorn backend.main:app --reload
```

Base URL: `http://127.0.0.1:8000`

## API Endpoints

- `GET /api/health`
- `POST /api/analyze`

### Sample Analyze Request

```json
{
  "holdings": [
    { "ticker": "RELIANCE", "weight": 50 },
    { "ticker": "TCS", "weight": 30 },
    { "ticker": "INFY", "weight": 20 }
  ],
  "benchmark": "^NSEI",
  "period": "2y",
  "interval": "1d",
  "confidence": 0.95,
  "risk_free_rate": 0.065,
  "horizon_days": 10,
  "simulations": 5000,
  "seed": 42
}
```

### Sample cURL

```bash
curl -X POST 'http://127.0.0.1:8000/api/analyze' \
  -H 'Content-Type: application/json' \
  -d '{
    "holdings": [
      {"ticker": "RELIANCE", "weight": 50},
      {"ticker": "TCS", "weight": 30},
      {"ticker": "INFY", "weight": 20}
    ],
    "benchmark": "^NSEI",
    "period": "2y",
    "interval": "1d",
    "confidence": 0.95,
    "risk_free_rate": 0.065,
    "horizon_days": 10,
    "simulations": 5000,
    "seed": 42
  }'
```

## Run Tests

```bash
pytest -q
```

## Notes

- For Indian equities, `.NS` suffix is auto-applied when missing.
- Internet is required for `/api/analyze` because it pulls live/historical market data.
