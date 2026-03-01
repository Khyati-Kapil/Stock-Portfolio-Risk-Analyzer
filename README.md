#Links

- PPT link - <https://www.canva.com/design/DAHCrmViys4/sqxSRCeT0cATBMzkgpFnRg/edit?utm_content=DAHCrmViys4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton>
- Demo Video Link - <https://drive.google.com/file/d/1Ika3hdXuy1KHAdiCgLfTkNc4JH2J_xt7/view?usp=sharing>




# Stock Portfolio Risk Analyzer

Full-stack portfolio risk analytics app with screenshot-to-holdings OCR, advanced charting, Gemini narrative insights, and Google OAuth authentication.

## Tech Stack

- Frontend: React (CRA), Axios, Recharts, React Router
- Backend: FastAPI, Uvicorn, Pydantic
- Data/Quant: pandas, numpy, yfinance
- AI: OpenAI (OCR/parsing) + Gemini (risk narrative)
- Auth: Google OAuth + JWT (`python-jose`)

## Project Structure

```text
backend/
  main.py
  ai/
  auth/
  data/
  risk/
frontend/
  src/
    auth/
    components/
      AdvancedCharts/
    pages/
requirements.txt
```

## 1) Install Dependencies

### Backend

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer
python3 -m venv venv2
source venv2/bin/activate
pip install -r requirements.txt
```

### Frontend

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer/frontend
npm install
```

## 2) Environment Variables

Create root `.env`:

```env
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8088/api/auth/callback
FRONTEND_OAUTH_CALLBACK=http://localhost:3000/auth/callback
JWT_SECRET=your_random_secret
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MAX_UPLOAD_BYTES=5242880
```

Notes:
- `GOOGLE_REDIRECT_URI` must match your Google Cloud OAuth redirect URI.
- `FRONTEND_OAUTH_CALLBACK` should match your frontend callback route.

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8088/api
```

## 3) Run the App

### Terminal 1: Backend

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer
source venv2/bin/activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8088
```

### Terminal 2: Frontend

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer/frontend
npm start
```

Open:
- Frontend: `http://localhost:3000`
- Backend health: `http://127.0.0.1:8088/api/health`

## 4) Helpful Run Commands

### Run backend tests

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer
source venv2/bin/activate
pytest -q
```

### Run frontend tests

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer/frontend
CI=true npm test -- --watchAll=false
```

### Build frontend

```bash
cd /Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer/frontend
npm run build
```

### Free port 8088 if already in use

```bash
lsof -t -iTCP:8088 -sTCP:LISTEN | xargs -n 1 kill
```

## 5) Deploy on Render

This repo includes [`render.yaml`](/Users/atharvpaharia100/Desktop/Projects/Overclock/Stock-Portfolio-Risk-Analyzer/render.yaml) for blueprint deploy.

### Render deploy steps

1. Push `main` to GitHub.
2. In Render: `New` -> `Blueprint` -> select this repo.
3. Render will create:
   - `bulls-bears-api` (FastAPI web service)
   - `bulls-bears-web` (React static site)
4. Set secret env vars in Render:
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `FRONTEND_OAUTH_CALLBACK`
   - `CORS_ALLOW_ORIGINS`
   - `REACT_APP_API_BASE_URL`

### Required production URL mapping

- `REACT_APP_API_BASE_URL`:
  - `https://<your-api-service>.onrender.com/api`
- `GOOGLE_REDIRECT_URI`:
  - `https://<your-api-service>.onrender.com/api/auth/callback`
- `FRONTEND_OAUTH_CALLBACK`:
  - `https://<your-web-service>.onrender.com/auth/callback`
- `CORS_ALLOW_ORIGINS`:
  - `https://<your-web-service>.onrender.com`

### Google OAuth Console setup

In Google Cloud OAuth credentials, add:
- Authorized redirect URI:
  - `https://<your-api-service>.onrender.com/api/auth/callback`
- Authorized JavaScript origins:
  - `https://<your-web-service>.onrender.com`

## API Endpoints

- `GET /api/health`
- `POST /api/upload`
- `POST /api/analyze`
- `GET /api/auth/google`
- `GET /api/auth/callback`
- `GET /api/auth/me`
- `GET /api/auth/logout`

## Sample Analyze Request

```bash
curl -X POST 'http://127.0.0.1:8088/api/analyze' \
  -H 'Content-Type: application/json' \
  -d '{
    "holdings": [
      {"ticker": "TCS.NS", "weight": 0.6},
      {"ticker": "INFY.NS", "weight": 0.4}
    ],
    "benchmark": "^NSEI",
    "period": "1y",
    "interval": "1d"
  }'
```

## Features

- Portfolio OCR extraction from screenshot upload
- Risk metrics: VaR/CVaR, Monte Carlo VaR, Sharpe, Beta/Alpha/R², Correlation
- Advanced charts dashboard:
  - Cumulative portfolio vs benchmark
  - Drawdown
  - Rolling volatility
  - Weights donut
  - Return distribution + VaR marker
  - Heatmap by holdings
- Gemini AI narrative summary
- Google OAuth login + protected app route

