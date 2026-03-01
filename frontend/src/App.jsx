import React, { useState } from 'react';
import './index.css';
import PortfolioInput from './components/PortfolioInput';
import RiskMetricCard from './components/RiskMetricCard';
import CorrelationMatrix from './components/CorrelationMatrix';
import TrendSignalPanel from './components/TrendSignalPanel';
import NewsFeed from './components/NewsFeed';
import MonteCarloPaths from './components/MonteCarloPaths';
import BeginnerInsights from './components/BeginnerInsights';
import RiskCharts from './components/RiskCharts';
import { analyzePortfolio } from './api/riskApi';
import { getErrorMessage } from './utils/errorMessage';

function App() {
  const [holdings, setHoldings] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleHoldingsUpdate = (payload) => {
    if (!payload) return;

    if (Array.isArray(payload)) {
      setHoldings(payload);
      setMetricsData(null);
      return;
    }

    if (payload.tickers && payload.weights) {
      const combined = payload.tickers.map((ticker, i) => ({
        ticker,
        weight: payload.weights[i],
      }));
      setHoldings(combined);
      setMetricsData(null);
    }
  };

  const handleAnalyze = async () => {
    if (holdings.length === 0) {
      setError("Please add at least one holding before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const sanitizedHoldings = holdings
        .map((item) => ({
          ticker: String(item.ticker || '').trim().toUpperCase(),
          weight: Number(item.weight),
        }))
        .filter((item) => item.ticker && Number.isFinite(item.weight) && item.weight > 0);

      if (sanitizedHoldings.length === 0) {
        setError('No valid holdings found. Please check ticker and weight values.');
        setIsAnalyzing(false);
        return;
      }

      const payload = {
        holdings: sanitizedHoldings,
        benchmark: '^NSEI',
        period: '1y',
        interval: '1d',
        confidence: 0.95,
        risk_free_rate: 0.065,
        horizon_days: 10,
        simulations: 3000,
        seed: 42,
      };

      const data = await analyzePortfolio(payload);
      setMetricsData(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(getErrorMessage(err, "Failed to analyze portfolio. Please check server."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div>
          <h1>Portfolio Risk Analyzer</h1>
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>V1.0 • OVERCLOCK</div>
      </header>

      <main className="dashboard-grid">
        <aside className="left-panel">
          <PortfolioInput
            holdings={holdings}
            onUpdate={handleHoldingsUpdate}
          />

          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || holdings.length === 0}
            style={{ marginTop: '1.5rem' }}
          >
            {isAnalyzing ? <span className="loader-spinner"></span> : "Analyze Risk"}
          </button>

          {error && <div className="error-text">{error}</div>}

          {metricsData && <TrendSignalPanel metrics={metricsData.metrics} />}

          {holdings.length > 0 && <NewsFeed tickers={holdings.map(h => h.ticker)} />}
        </aside>

        <section className="right-panel">
          {metricsData ? (
            <>
              <RiskMetricCard metrics={metricsData.metrics} />

              <RiskCharts metrics={metricsData.metrics} holdings={holdings} />

              <BeginnerInsights
                metrics={metricsData.metrics}
                correlationMatrix={metricsData.correlation_matrix}
              />

              <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="card-title">Correlation Matrix</h3>
                <CorrelationMatrix matrix={metricsData.correlation_matrix} />
              </div>

              <MonteCarloPaths />
            </>
          ) : (
            <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <p>Upload your portfolio to view risk analytics.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
