import os
import asyncio
from backend.ai.gemini_analyzer import generate_portfolio_narrative

metrics = {'historical_var': 0.05, 'parametric_var': 0.04, 'parametric_cvar': 0.06, 'monte_carlo_var': 0.055, 'sharpe_ratio': 1.2, 'beta': 0.9, 'alpha_annual': 0.02, 'r_squared': 0.85, 'observations': 252}
holdings = [{'ticker': 'AAPL.NS', 'weight': 1.0}]
correlation = {'AAPL.NS': {'AAPL.NS': 1.0}}

try:
    print(generate_portfolio_narrative(metrics, holdings, correlation))
except Exception as e:
    import traceback
    traceback.print_exc()
