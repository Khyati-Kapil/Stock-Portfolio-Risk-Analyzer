import base64
import json
import os
from typing import Any, Dict, List

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


DEFAULT_MIME_TYPE = "image/jpeg"
TICKER_ALIASES = {
    "BAJAJHF.NS": "BAJAJHFL.NS",
    "BAJAJHFN.NS": "BAJAJHFL.NS",
    "BAJAJHFC.NS": "BAJAJHFL.NS",
    "BAJAJHFCL.NS": "BAJAJHFL.NS",
    "BAJAJFINANCE.NS": "BAJFINANCE.NS",
}


def _openai_client() -> OpenAI:
    if OpenAI is None:
        raise ImportError("openai is not installed. Please `pip install openai`.")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")

    return OpenAI(api_key=api_key)


def _safe_float(value: Any) -> float:
    try:
        if value in (None, ""):
            return 0.0
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _normalize_ticker_symbol(raw_ticker: Any) -> str:
    ticker = str(raw_ticker or "").strip().upper()
    if not ticker:
        return ""
    return TICKER_ALIASES.get(ticker, ticker)


def build_portfolio_payload(portfolio: List[Dict[str, Any]]) -> Dict[str, Any]:
    entries: List[Dict[str, float | str]] = []

    for item in portfolio:
        ticker = _normalize_ticker_symbol(item.get("ticker", ""))
        if not ticker:
            continue

        quantity = _safe_float(item.get("quantity", 0))
        average_price = _safe_float(item.get("average_price", 0))
        computed_value = quantity * average_price
        total_value = _safe_float(item.get("total_value", 0))
        value = computed_value if computed_value > 0 else total_value

        entries.append({"ticker": ticker, "value": value})

    if not entries:
        return {
            "tickers": [],
            "weights": [],
            "raw_parsed": portfolio,
        }

    positive_entries = [entry for entry in entries if float(entry["value"]) > 0]
    if positive_entries:
        tickers = [str(entry["ticker"]) for entry in positive_entries]
        values = [float(entry["value"]) for entry in positive_entries]
        total_value = sum(values)
        weights = [value / total_value for value in values]
    else:
        tickers = [str(entry["ticker"]) for entry in entries]
        weights = [1.0 / len(tickers)] * len(tickers)

    return {
        "tickers": tickers,
        "weights": weights,
        "raw_parsed": portfolio,
    }


def extract_text_from_image(image_path: str, mime_type: str = DEFAULT_MIME_TYPE) -> str:
    """Extract raw OCR text from an image using OpenAI vision."""
    client = _openai_client()

    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Perform OCR on this image and return only raw extracted text.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type or DEFAULT_MIME_TYPE};base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        max_tokens=1500,
    )

    message = response.choices[0].message if response.choices else None
    content = getattr(message, "content", None)
    if content is None:
        raise ValueError("OCR model returned an empty response.")

    if isinstance(content, str):
        text = content.strip()
    elif isinstance(content, list):
        parts = [part.get("text", "") for part in content if isinstance(part, dict)]
        text = "\n".join(part.strip() for part in parts if part and part.strip())
    else:
        text = str(content).strip()

    if not text:
        raise ValueError("No text detected in uploaded image.")

    return text


def parse_ocr_text_to_portfolio(ocr_text: str) -> Dict[str, Any]:
    """
    Parse OCR text into holdings JSON.
    Returns: {"tickers": [...], "weights": [...], "raw_parsed": [...]}
    """
    if not ocr_text or not ocr_text.strip():
        raise ValueError("OCR text is empty.")

    client = _openai_client()

    prompt = f"""
You are a financial data extraction system.

Your task is to extract stock portfolio information from OCR text of a brokerage screenshot.

Extract the following fields for each stock:
- ticker (convert to NSE format with .NS suffix)
- quantity (integer)
- average_price (float, remove currency symbols)
- total_value (if available)

Rules:
1. Only extract actual stock holdings, ignore headers, menus, and unrelated text.
2. Convert ticker symbols to uppercase.
3. Add ".NS" suffix to each ticker.
4. If only company name is present, infer ticker symbol logically.
5. Return output strictly in JSON format.
6. Do not include explanations.

Return schema:
{{
  "portfolio": [
    {{
      "ticker": "RELIANCE.NS",
      "quantity": 10,
      "average_price": 2450
    }}
  ]
}}

OCR TEXT:
{ocr_text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that strictly outputs JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    message = response.choices[0].message if response.choices else None
    content = getattr(message, "content", None)
    if not content:
        raise ValueError("Parser model returned an empty response.")

    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("Parser model returned non-JSON output.") from exc

    portfolio = data.get("portfolio", [])
    if not isinstance(portfolio, list):
        raise ValueError("Parser output schema is invalid.")

    return build_portfolio_payload(portfolio)
