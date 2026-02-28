import io
import json
import os
from typing import Dict, Any

try:
    from google.cloud import vision
except ImportError:
    vision = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


def extract_text_from_image(image_path: str) -> str:
    """
    Extracts text from an image using Google Cloud Vision API.
    """
    if vision is None:
        raise ImportError("google-cloud-vision is not installed. Please `pip install google-cloud-vision`.")
        
    client = vision.ImageAnnotatorClient()

    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if texts:
        return texts[0].description
    else:
        return ""

def parse_ocr_text_to_portfolio(ocr_text: str) -> Dict[str, Any]:
    """
    Parses raw OCR text into a structured portfolio JSON using OpenAI GPT.
    Returns: {"tickers": [...], "weights": [...]}
    """
    if OpenAI is None:
        raise ImportError("openai is not installed. Please `pip install openai`.")
        
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")

    client = OpenAI(api_key=api_key)

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

Example output:
{{
  "portfolio": [
    {{
      "ticker": "RELIANCE.NS",
      "quantity": 10,
      "average_price": 2450
    }},
    {{
      "ticker": "TCS.NS",
      "quantity": 5,
      "average_price": 3800
    }}
  ]
}}

OCR TEXT:
{ocr_text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that strictly outputs JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )

    content = response.choices[0].message.content
    data = json.loads(content)
    
    portfolio = data.get("portfolio", [])
    
    tickers = []
    values = []
    
    for item in portfolio:
        tickers.append(item["ticker"])
        # Calculate holding value
        val = item.get("quantity", 0) * item.get("average_price", 0)
        # Fallback to total_value if available and computed val is 0
        if val == 0 and "total_value" in item:
            val = item["total_value"]
        values.append(val)
        
    total_val = sum(values)
    
    if total_val > 0:
        weights = [v / total_val for v in values]
    else:
        # Equal weighting fallback if prices aren't extracted
        weights = [1.0 / len(tickers)] * len(tickers) if tickers else []
        
    return {
        "tickers": tickers,
        "weights": weights,
        "raw_parsed": portfolio
    }
