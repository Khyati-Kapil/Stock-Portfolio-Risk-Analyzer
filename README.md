# NSE/BSE Portfolio Risk Analyzer

> A beginner-friendly, React-powered dashboard that brings professional portfolio risk metrics, trend signals, and statistical simulations into one unified tool for Indian retail investors.

---

## Problem Statement

Retail investors in India lack access to simple, visual tools that combine **real-time NSE/BSE market data**, **professional risk metrics** (VaR, Sharpe Ratio, Beta), and **trend analysis** into one dashboard. This leads to poor risk awareness and uninformed buy/sell decisions.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| Retail investors | Managing personal equity portfolios on NSE/BSE |
| Finance students | Learning risk analysis in practice |
| Beginner traders | Seeking data-driven buy/sell guidance |
| Small portfolio managers | Managing < Rs. 50L portfolios |

**Not targeting:** HFT traders, institutional funds, derivatives desks.

---

## Features

### Core (MVP)
- Portfolio input (NSE tickers + weights or amount invested)
- Live & historical price data via free APIs
- **Value at Risk (VaR)** — Historical & Monte Carlo
- **Sharpe Ratio** — Risk-adjusted return
- **Beta** — Volatility vs NIFTY 50 benchmark
- **Correlation Matrix** — Inter-stock relationships
- **Trend Signals** — RSI, MACD, Moving Averages
- Buy / Sell / Hold signal dashboard per stock

### Nice-to-Have
- News sentiment feed (per stock)
- Scenario analysis sliders (market crash simulation)
- Portfolio rebalancing suggestions
- PDF risk report export
- Risk alert notifications

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React + Vite | UI framework |
| Recharts / Chart.js | Charts & visualizations |
| TailwindCSS | Styling |
| Axios | API calls |

### Backend
| Tool | Purpose |
|------|---------|
| Python + FastAPI | REST API server |
| Pandas + NumPy | Data processing |
| SciPy | Statistical computations |
| yfinance / nsepy | NSE/BSE price data |

### Free APIs Used
| API | Data Provided | Cost |
|-----|--------------|------|
| `yfinance` (Yahoo Finance) | Historical OHLCV prices for NSE (`.NS` suffix) | Free |
| Alpha Vantage | Technical indicators (RSI, MACD, SMA) | Free tier |
| NewsAPI | Market news per ticker | Free tier |
| NSE India (unofficial) | Real-time NSE data | Free |

---

## Repository Structure

```
NSE-Portfolio-Risk-Analyzer/
|
|-- README.md
|-- requirements.txt          # Python dependencies
|-- package.json              # Node/React dependencies
|
|-- backend/
|   |-- main.py               # FastAPI entry point
|   |-- data/
|   |   |-- fetcher.py        # yfinance / NSE data fetching
|   |   `-- preprocessor.py   # Returns, normalization
|   |-- risk/
|   |   |-- var.py            # VaR (Historical + Monte Carlo)
|   |   |-- sharpe.py         # Sharpe Ratio
|   |   |-- beta.py           # Beta vs NIFTY 50
|   |   `-- correlation.py    # Correlation matrix
|   |-- signals/
|   |   |-- trend.py          # RSI, MACD, Moving Averages
|   |   `-- sentiment.py      # News API sentiment
|   `-- simulation/
|       `-- monte_carlo.py    # Price path simulation
|
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- components/
|   |   |   |-- PortfolioInput.jsx     # Ticker + weight input
|   |   |   |-- RiskMetricCard.jsx     # VaR / Sharpe / Beta cards
|   |   |   |-- CorrelationMatrix.jsx  # Heatmap component
|   |   |   |-- MonteCarloPaths.jsx    # Simulation chart
|   |   |   |-- TrendSignalPanel.jsx   # Buy/Sell/Hold signals
|   |   |   `-- NewsFeed.jsx           # Sentiment feed
|   |   |-- api/
|   |   |   `-- riskApi.js             # Axios calls to backend
|   |   `-- utils/
|   |       `-- formatters.js          # Currency formatting, % display
|   `-- public/
|
|-- data/
|   `-- sample_portfolio.csv   # Sample NSE portfolio for testing
|
`-- docs/
    |-- architecture.md
    `-- api_reference.md
```

---

## Data Flow

```
User Input (tickers + weights)
        |
NSE/Yahoo Finance API (price history)
        |
Return Calculation (daily % change)
        |
Risk Metrics Engine (VaR, Sharpe, Beta, Correlation)
        |
Trend Signal Engine (RSI, MACD, SMA crossovers)
        |
Monte Carlo Simulation (future price paths)
        |
React Dashboard (charts, signals, alerts)
```

---

## Core Risk Formulas

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **Historical VaR (95%)** | 5th percentile of return distribution | Max expected loss on 19/20 days |
| **Sharpe Ratio** | `(Rp - Rf) / sigma_p` | Return per unit of risk |
| **Beta** | `Cov(Rp, Rm) / Var(Rm)` | Sensitivity vs NIFTY 50 |
| **Correlation** | Pearson correlation matrix | How stocks move together |

Risk-free rate default: **6.5%** (RBI repo rate approximation)

---

## Constraints

- Internet required for live API data (CSV fallback available)
- Free API rate limits apply (Alpha Vantage: 5 calls/min)
- Monte Carlo accuracy improves with longer historical data (min 1 year recommended)
- NSE `.NS` suffix required for Yahoo Finance tickers (e.g., `RELIANCE.NS`)

---

## Quickstart (Planned)

```bash
# Backend
pip install -r requirements.txt
uvicorn backend.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Future Scope

- Options chain risk analysis
- Zerodha / Upstox brokerage API integration (direct trading)
- ML-based price direction prediction
- Multi-currency support (USD/INR hedging)
- Mobile-responsive PWA

---

## Team

> [Your team name here] | Hackathon 2025
