from __future__ import annotations

from typing import Iterable, Tuple

import numpy as np
import pandas as pd


def normalize_weights(weights: Iterable[float]) -> np.ndarray:
    arr = np.asarray(list(weights), dtype=float)
    if arr.size == 0:
        raise ValueError("Weights cannot be empty")
    if np.any(arr < 0):
        raise ValueError("Weights must be non-negative")
    total = arr.sum()
    if total <= 0:
        raise ValueError("Sum of weights must be positive")
    return arr / total


def compute_returns(prices: pd.DataFrame, method: str = "simple") -> pd.DataFrame:
    if prices.empty:
        raise ValueError("Price table is empty")

    if method.lower() == "log":
        rets = np.log(prices / prices.shift(1))
    else:
        rets = prices.pct_change()

    rets = rets.replace([np.inf, -np.inf], np.nan).dropna(how="all")
    if rets.empty:
        raise ValueError("Unable to compute returns from provided price data")
    return rets


def build_portfolio_returns(asset_returns: pd.DataFrame, weights: Iterable[float]) -> pd.Series:
    w = normalize_weights(weights)
    if asset_returns.shape[1] != w.size:
        raise ValueError("Number of weights must match number of assets")
    clean = asset_returns.dropna(how="any")
    if clean.empty:
        raise ValueError("Asset returns have no fully aligned rows")
    portfolio = clean.dot(w)
    portfolio.name = "portfolio_return"
    return portfolio


def align_return_series(
    portfolio_returns: pd.Series,
    benchmark_returns: pd.Series,
) -> Tuple[pd.Series, pd.Series]:
    aligned = pd.concat([portfolio_returns, benchmark_returns], axis=1).dropna(how="any")
    if aligned.empty:
        raise ValueError("Portfolio and benchmark returns do not overlap")
    return aligned.iloc[:, 0], aligned.iloc[:, 1]


def annualized_return(daily_returns: pd.Series, periods_per_year: int = 252) -> float:
    mu = float(daily_returns.mean())
    return (1 + mu) ** periods_per_year - 1


def annualized_volatility(daily_returns: pd.Series, periods_per_year: int = 252) -> float:
    sigma = float(daily_returns.std(ddof=1))
    return sigma * np.sqrt(periods_per_year)
