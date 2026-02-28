from __future__ import annotations

import math
import statistics
from typing import Tuple

import numpy as np
import pandas as pd


def historical_var(returns: pd.Series, confidence: float = 0.95) -> float:
    if returns.empty:
        raise ValueError("Returns series is empty")
    if not (0.0 < confidence < 1.0):
        raise ValueError("confidence must be between 0 and 1")
    q = np.percentile(returns.values, (1 - confidence) * 100)
    return max(0.0, float(-q))


def historical_cvar(returns: pd.Series, confidence: float = 0.95) -> float:
    if returns.empty:
        raise ValueError("Returns series is empty")
    cutoff = np.percentile(returns.values, (1 - confidence) * 100)
    tail = returns[returns <= cutoff]
    if tail.empty:
        return historical_var(returns, confidence)
    return max(0.0, float(-tail.mean()))


def parametric_var_cvar(returns: pd.Series, confidence: float = 0.95) -> Tuple[float, float]:
    if returns.empty:
        raise ValueError("Returns series is empty")

    mu = float(returns.mean())
    sigma = float(returns.std(ddof=1))
    if sigma == 0:
        loss = max(0.0, -mu)
        return loss, loss

    alpha = 1 - confidence
    z = statistics.NormalDist().inv_cdf(alpha)
    pdf_z = math.exp(-0.5 * z * z) / math.sqrt(2 * math.pi)

    var_return = mu + sigma * z
    cvar_return = mu - sigma * (pdf_z / alpha)
    return max(0.0, -var_return), max(0.0, -cvar_return)


def monte_carlo_var(
    returns: pd.Series,
    confidence: float = 0.95,
    n_sims: int = 10000,
    horizon_days: int = 1,
    seed: int | None = None,
) -> float:
    if returns.empty:
        raise ValueError("Returns series is empty")
    if n_sims <= 0:
        raise ValueError("n_sims must be positive")
    if horizon_days <= 0:
        raise ValueError("horizon_days must be positive")

    rng = np.random.default_rng(seed)
    mu = float(returns.mean())
    sigma = float(returns.std(ddof=1))

    draws = rng.normal(loc=mu, scale=sigma, size=(n_sims, horizon_days))
    path_returns = (1 + draws).prod(axis=1) - 1
    q = np.percentile(path_returns, (1 - confidence) * 100)
    return max(0.0, float(-q))
