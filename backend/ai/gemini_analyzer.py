from __future__ import annotations

import os
from typing import Dict, Iterable

try:
    import google.generativeai as genai
except ImportError:
    genai = None


def _format_holdings(holdings: Iterable[dict]) -> str:
    rows = []
    for item in holdings:
        ticker = str(item.get("ticker", "")).upper().strip()
        weight = float(item.get("weight", 0.0)) * 100
        rows.append(f"- {ticker}: {weight:.2f}%")
    return "\n".join(rows)


def _correlation_highlights(correlation_matrix: Dict[str, Dict[str, float]]) -> str:
    pairs = []
    keys = list(correlation_matrix.keys())
    for i, left in enumerate(keys):
        for right in keys[i + 1 :]:
            value = correlation_matrix.get(left, {}).get(right)
            if value is None:
                continue
            pairs.append((left, right, float(value)))
    if not pairs:
        return "No pairwise correlation data available."

    pairs.sort(key=lambda row: abs(row[2]), reverse=True)
    top = pairs[:3]
    return "\n".join([f"- {a} vs {b}: {c:.3f}" for a, b, c in top])


def generate_portfolio_narrative(
    metrics: dict,
    holdings: list,
    correlation_matrix: Dict[str, Dict[str, float]],
) -> str:
    if genai is None:
        raise RuntimeError("google-generativeai is not installed")

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
You are a senior portfolio risk analyst.
Provide a concise, practical risk review for this portfolio.

Portfolio Holdings:
{_format_holdings(holdings)}

Risk Metrics:
- Historical VaR: {metrics.get('historical_var', 0):.4f}
- Parametric VaR: {metrics.get('parametric_var', 0):.4f}
- Parametric CVaR: {metrics.get('parametric_cvar', 0):.4f}
- Monte Carlo VaR: {metrics.get('monte_carlo_var', 0):.4f}
- Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.4f}
- Beta: {metrics.get('beta', 0):.4f}
- Alpha (Annual): {metrics.get('alpha_annual', 0):.4f}
- R-squared: {metrics.get('r_squared', 0):.4f}
- Observations: {metrics.get('observations', 0)}

Correlation Highlights:
{_correlation_highlights(correlation_matrix)}

Output format:
Overall:
<summary>

Concerns:
1) ...
2) ...
3) ...

Diversification:
<commentary>

Suggestions:
1) ...
2) ...
3) ...

Rules:
- Cite specific metric values in each section.
- Keep total output under 250 words.
- No markdown tables.
""".strip()

    response = model.generate_content(prompt)
    text = getattr(response, "text", None)
    if text and text.strip():
        return text.strip()

    candidates = getattr(response, "candidates", None)
    if candidates:
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            parts = getattr(content, "parts", [])
            merged = "\n".join(
                getattr(part, "text", "").strip() for part in parts if getattr(part, "text", "").strip()
            )
            if merged:
                return merged

    raise RuntimeError("Gemini response was empty")
