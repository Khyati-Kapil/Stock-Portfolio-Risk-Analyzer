import numpy as np
import pandas as pd

from backend.risk.beta import beta_alpha
from backend.risk.correlation import correlation_matrix
from backend.risk.sharpe import sharpe_ratio
from backend.risk.var import (historical_var, monte_carlo_var,
                              parametric_var_cvar)


def _sample_returns(n=300, seed=7):
    rng = np.random.default_rng(seed)
    idx = pd.date_range("2024-01-01", periods=n, freq="B")
    a = pd.Series(rng.normal(0.0005, 0.015, size=n), index=idx)
    b = pd.Series(rng.normal(0.0003, 0.012, size=n), index=idx)
    m = pd.Series(rng.normal(0.0004, 0.011, size=n), index=idx)
    return a, b, m


def test_var_outputs_are_non_negative():
    a, b, _ = _sample_returns()
    port = 0.6 * a + 0.4 * b

    h = historical_var(port, confidence=0.95)
    p_var, p_cvar = parametric_var_cvar(port, confidence=0.95)
    mc = monte_carlo_var(port, confidence=0.95, n_sims=1000, horizon_days=10, seed=42)

    assert h >= 0
    assert p_var >= 0
    assert p_cvar >= 0
    assert mc >= 0


def test_sharpe_returns_float():
    a, b, _ = _sample_returns()
    port = 0.6 * a + 0.4 * b
    value = sharpe_ratio(port)
    assert isinstance(value, float)


def test_beta_payload_shape():
    a, b, m = _sample_returns()
    port = 0.6 * a + 0.4 * b
    out = beta_alpha(port, m)

    assert "beta" in out
    assert "alpha_annual" in out
    assert "r_squared" in out
    assert "observations" in out
    assert out["observations"] > 0


def test_correlation_matrix_shape():
    a, b, _ = _sample_returns()
    rets = pd.DataFrame({"A": a, "B": b})
    corr = correlation_matrix(rets)

    assert corr.shape == (2, 2)
    assert np.isclose(corr.loc["A", "A"], 1.0)
    assert np.isclose(corr.loc["B", "B"], 1.0)
