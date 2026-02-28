from __future__ import annotations

import math

import pandas as pd


def sharpe_ratio(
    returns: pd.Series,
    risk_free_rate: float = 0.065,
    periods_per_year: int = 252,
) -> float:
    if returns.empty:
        raise ValueError("Returns series is empty")

    rf_daily = (1 + risk_free_rate) ** (1 / periods_per_year) - 1
    excess = returns - rf_daily
    sigma = float(excess.std(ddof=1))
    if sigma == 0:
        return 0.0
    return float(excess.mean()) / sigma * math.sqrt(periods_per_year)


def sortino_ratio(
    returns: pd.Series,
    risk_free_rate: float = 0.065,
    periods_per_year: int = 252,
) -> float:
    if returns.empty:
        raise ValueError("Returns series is empty")

    rf_daily = (1 + risk_free_rate) ** (1 / periods_per_year) - 1
    excess = returns - rf_daily
    downside = excess[excess < 0]
    downside_dev = float(downside.std(ddof=1)) if not downside.empty else 0.0
    if downside_dev == 0:
        return 0.0
    return float(excess.mean()) / downside_dev * math.sqrt(periods_per_year)
