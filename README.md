# Stock Portfolio Risk Analyzer

FastAPI + React application for portfolio risk analytics, with optional screenshot upload for AI-assisted holdings extraction.

## What It Does

- Accepts portfolio holdings (`ticker`, `weight`)
- Optionally extracts holdings from a portfolio screenshot (`/api/upload`)
- Fetches historical prices from Yahoo Finance (`yfinance`)
- Computes core risk metrics:
  - Historical VaR
  - Parametric VaR / CVaR
  - Monte Carlo VaR
  - Sharpe Ratio
  - Beta / Alpha / R-squared (vs benchmark)
  - Correlation matrix

## Project Structure

```text
backend/
  main.py
  data/
    fetcher.py
    preprocessor.py
    scraper.py
  risk/
    var.py
    sharpe.py
    beta.py
    correlation.py
frontend/
  src/
    api/riskApi.js
    components/
tests/
requirements.txt
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Environment Variables

Create `.env` in the repo root if needed.

```env
OPENAI_API_KEY=your_key_here
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MAX_UPLOAD_BYTES=5242880
REACT_APP_API_BASE_URL=http://127.0.0.1:8088/api
```

Notes:
- `CORS_ALLOW_ORIGINS` is optional (comma-separated list).
- `MAX_UPLOAD_BYTES` defaults to 5MB.
- Frontend falls back to `http://127.0.0.1:8088/api` if `REACT_APP_API_BASE_URL` is unset.

## Run Backend

```bash
uvicorn backend.main:app --reload --port 8088
```

Base URL: `http://127.0.0.1:8088`

## Run Frontend (CRA)

```bash
cd frontend
npm install
npm start
```

Frontend default URL: `http://localhost:3000`

## API Endpoints

- `GET /api/health`
- `POST /api/upload`
- `POST /api/analyze`

### Sample Analyze Request

```json
{
  "holdings": [
    { "ticker": "RELIANCE.NS", "weight": 0.5 },
    { "ticker": "TCS.NS", "weight": 0.3 },
    { "ticker": "INFY.NS", "weight": 0.2 }
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
curl -X POST 'http://127.0.0.1:8088/api/analyze' \
  -H 'Content-Type: application/json' \
  -d '{
    "holdings": [
      {"ticker": "RELIANCE.NS", "weight": 0.5},
      {"ticker": "TCS.NS", "weight": 0.3},
      {"ticker": "INFY.NS", "weight": 0.2}
    ]
  }'
```

## Run Tests

```bash
pytest -q
```

## Notes

- For Indian equities, `.NS` suffix is auto-applied when missing in `/api/analyze` inputs.
- Internet access is required for `/api/analyze` (Yahoo Finance) and `/api/upload` (OpenAI OCR/parsing).
