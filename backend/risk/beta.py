from __future__ import annotations

import numpy as np
import pandas as pd


def beta_alpha(
    portfolio_returns: pd.Series,
    benchmark_returns: pd.Series,
    risk_free_rate: float = 0.065,
    periods_per_year: int = 252,
) -> dict:
    aligned = pd.concat([portfolio_returns, benchmark_returns], axis=1).dropna(how="any")
    if aligned.empty:
        raise ValueError("No overlapping portfolio/benchmark returns")

    rp = aligned.iloc[:, 0].astype(float)
    rm = aligned.iloc[:, 1].astype(float)

    var_m = float(np.var(rm, ddof=1))
    if var_m == 0:
        beta = 0.0
    else:
        cov_pm = float(np.cov(rp, rm, ddof=1)[0, 1])
        beta = cov_pm / var_m

    rf_daily = (1 + risk_free_rate) ** (1 / periods_per_year) - 1
    alpha_daily = float((rp - rf_daily).mean() - beta * (rm - rf_daily).mean())
    alpha_annual = (1 + alpha_daily) ** periods_per_year - 1

    corr = float(np.corrcoef(rp, rm)[0, 1]) if len(aligned) > 1 else 0.0
    r_squared = corr * corr

    return {
        "beta": beta,
        "alpha_annual": alpha_annual,
        "r_squared": r_squared,
        "observations": int(len(aligned)),
    }
