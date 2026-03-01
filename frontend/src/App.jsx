import React, { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import PortfolioInput from './components/PortfolioInput';
import RiskMetricCard from './components/RiskMetricCard';
import CorrelationMatrix from './components/CorrelationMatrix';
import TrendSignalPanel from './components/TrendSignalPanel';
import NewsFeed from './components/NewsFeed';
import MonteCarloPaths from './components/MonteCarloPaths';
import BeginnerInsights from './components/BeginnerInsights';
import ChartsDashboard from './components/AdvancedCharts/ChartsDashboard';
import GeminiNarrative from './components/GeminiNarrative';
import { analyzePortfolio } from './api/riskApi';
import { useAuth } from './auth/AuthContext';
import LandingPage from './pages/LandingPage';
import CallbackPage from './pages/CallbackPage';
import { getErrorMessage } from './utils/errorMessage';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0f19', color: '#e5ecff' }}>
        <div>Validating session...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AnalyzerPage() {
  const { user, logout } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const buildAnalyzePayload = useCallback(() => {
    const sanitizedHoldings = holdings
      .map((item) => ({
        ticker: String(item.ticker || '').trim().toUpperCase(),
        weight: Number(item.weight),
      }))
      .filter((item) => item.ticker && Number.isFinite(item.weight) && item.weight > 0);

    return {
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
  }, [holdings]);

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

  const runAnalysis = useCallback(async () => {
    if (holdings.length === 0) {
      setError('Please add at least one holding before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const payload = buildAnalyzePayload();
      if (payload.holdings.length === 0) {
        setError('No valid holdings found. Please check ticker and weight values.');
        return;
      }

      const data = await analyzePortfolio(payload);
      setMetricsData(data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(getErrorMessage(err, 'Failed to analyze portfolio. Please check server.'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [buildAnalyzePayload, holdings.length]);

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div>
          <h1>Bulls&Bears</h1>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Portfolio Risk Intelligence
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && (
            <>
              <img
                src={user.picture || 'https://via.placeholder.com/32'}
                alt={user.name || 'User'}
                width={32}
                height={32}
                style={{ borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{user.name || user.email}</span>
              <button className="btn" style={{ width: 'auto', padding: '0.45rem 0.85rem' }} onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="left-panel">
          <PortfolioInput holdings={holdings} onUpdate={handleHoldingsUpdate} />

          <button
            className="btn btn-primary"
            onClick={runAnalysis}
            disabled={isAnalyzing || holdings.length === 0}
            style={{ marginTop: '1.5rem' }}
          >
            {isAnalyzing ? <span className="loader-spinner"></span> : 'Run Bulls&Bears Analysis'}
          </button>

          {error && <div className="error-text">{error}</div>}

          {metricsData && <TrendSignalPanel metrics={metricsData.metrics} />}
          {holdings.length > 0 && <NewsFeed tickers={holdings.map((h) => h.ticker)} />}
        </aside>

        <section className="right-panel">
          {metricsData ? (
            <>
              <RiskMetricCard metrics={metricsData.metrics} />

              <ChartsDashboard analysisData={metricsData} holdings={holdings} />

              <GeminiNarrative
                narrative={metricsData.gemini_narrative}
                isLoading={isAnalyzing}
                onRegenerate={runAnalysis}
              />

              <BeginnerInsights
                metrics={metricsData.metrics}
                correlationMatrix={metricsData.correlation_matrix}
              />

              <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="card-title">Correlation Matrix</h3>
                <CorrelationMatrix matrix={metricsData.correlation_matrix} />
              </div>

              <MonteCarloPaths paths={metricsData.monte_carlo_paths} />
            </>
          ) : (
            <div
              className="glass-card"
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'var(--text-tertiary)',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '1rem', opacity: 0.5 }}
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <p>Upload your portfolio to view risk analytics.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route
        path="/app"
        element={(
          <ProtectedRoute>
            <AnalyzerPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
