import React, { useMemo, useState } from 'react';

import CorrelationMatrix from './components/CorrelationMatrix';
import PortfolioInput from './components/PortfolioInput';
import RiskMetricCard from './components/RiskMetricCard';
import { analyzePortfolio, uploadPortfolioImage } from './api/riskApi';

const DEFAULT_ROWS = [
  { ticker: 'RELIANCE', weight: '50' },
  { ticker: 'TCS', weight: '30' },
  { ticker: 'INFY', weight: '20' },
];

const METRIC_CONFIG = [
  ['historical_var', 'Historical VaR', 'percent'],
  ['parametric_var', 'Parametric VaR', 'percent'],
  ['parametric_cvar', 'Parametric CVaR', 'percent'],
  ['monte_carlo_var', 'Monte Carlo VaR', 'percent'],
  ['sharpe_ratio', 'Sharpe Ratio', 'number'],
  ['beta', 'Beta', 'number'],
  ['alpha_annual', 'Alpha (Annual)', 'percent'],
  ['r_squared', 'R Squared', 'number'],
  ['observations', 'Data Points', 'number'],
];

function averageOffDiagonalCorrelation(matrix) {
  if (!matrix) {
    return null;
  }
  const keys = Object.keys(matrix);
  if (keys.length < 2) {
    return 0;
  }

  let sum = 0;
  let count = 0;
  for (let i = 0; i < keys.length; i += 1) {
    for (let j = i + 1; j < keys.length; j += 1) {
      sum += Number(matrix[keys[i]][keys[j]]);
      count += 1;
    }
  }
  return count ? sum / count : 0;
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function App() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [benchmark, setBenchmark] = useState('^NSEI');
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [result, setResult] = useState(null);

  const totalWeight = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.weight) || 0), 0),
    [rows]
  );

  const beginnerInsights = useMemo(() => {
    if (!result?.metrics) {
      return null;
    }

    const m = result.metrics;
    const avgCorr = averageOffDiagonalCorrelation(result.correlation_matrix);

    const varValue = Number(m.historical_var || 0);
    const sharpeValue = Number(m.sharpe_ratio || 0);
    const betaValue = Number(m.beta || 0);
    const cvarValue = Number(m.parametric_cvar || 0);

    const riskLevel = varValue < 0.01 ? 'Low' : varValue < 0.02 ? 'Moderate' : 'High';
    const sharpeQuality = sharpeValue > 1 ? 'Good' : sharpeValue > 0 ? 'Average' : 'Weak';
    const betaLevel = betaValue > 1.2 ? 'Aggressive' : betaValue < 0.8 ? 'Defensive' : 'Market-like';
    const diversification = avgCorr > 0.7 ? 'Weak' : avgCorr > 0.4 ? 'Medium' : 'Strong';

    const actions = [];
    if (varValue >= 0.02 || cvarValue >= 0.025) {
      actions.push('Risk is on the higher side. Consider reducing concentrated positions.');
    }
    if (sharpeValue <= 0) {
      actions.push('Returns are not compensating for risk. Review asset mix and rebalance.');
    }
    if (betaValue > 1.2) {
      actions.push('Portfolio is likely to swing more than the market in both directions.');
    }
    if (avgCorr !== null && avgCorr > 0.7) {
      actions.push('Holdings move too similarly. Add lower-correlation assets for diversification.');
    }
    if (!actions.length) {
      actions.push('Current profile is reasonably balanced. Re-check metrics regularly as markets change.');
    }

    return {
      riskLevel,
      sharpeQuality,
      betaLevel,
      diversification,
      avgCorr,
      actions,
    };
  }, [result]);

  const onChangeRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const onAddRow = () => setRows((prev) => [...prev, { ticker: '', weight: '' }]);

  const onRemoveRow = (index) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const toPayload = () => ({
    holdings: rows
      .map((row) => ({
        ticker: row.ticker.trim().toUpperCase(),
        weight: Number(row.weight),
      }))
      .filter((row) => row.ticker && row.weight > 0),
    benchmark,
    period,
    interval: '1d',
    confidence: 0.95,
    risk_free_rate: 0.065,
    horizon_days: 10,
    simulations: 3000,
    seed: 42,
  });

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    const payload = toPayload();
    if (!payload.holdings.length) {
      setError('Add at least one valid holding.');
      return;
    }

    setLoading(true);
    try {
      const data = await analyzePortfolio(payload);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError('');
    setUploadMessage('Reading screenshot...');

    try {
      const data = await uploadPortfolioImage(file);
      const mappedRows = (data.tickers || []).map((ticker, i) => ({
        ticker: (ticker || '').replace('.NS', ''),
        weight: String(((data.weights?.[i] || 0) * 100).toFixed(2)),
      }));

      if (!mappedRows.length) {
        setUploadMessage('No holdings detected in screenshot.');
        return;
      }

      setRows(mappedRows);
      setUploadMessage('Holdings extracted successfully. Verify and click Analyze Portfolio.');
    } catch (err) {
      setUploadMessage('');
      setError(err?.response?.data?.detail || err.message || 'Upload parse failed');
    }
  };

  const metrics = result?.metrics || {};

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>Stock Portfolio Risk Analyzer</h1>
        <p>
          Enter holdings or upload a screenshot, then evaluate VaR, Sharpe, beta, and diversification quality.
        </p>
      </header>

      <PortfolioInput
        rows={rows}
        onChangeRow={onChangeRow}
        onAddRow={onAddRow}
        onRemoveRow={onRemoveRow}
        totalWeight={totalWeight}
        benchmark={benchmark}
        onBenchmarkChange={setBenchmark}
        period={period}
        onPeriodChange={setPeriod}
        onUpload={handleUpload}
        uploadMessage={uploadMessage}
        error={error}
        loading={loading}
        onAnalyze={handleAnalyze}
      />

      {result ? (
        <section className="panel">
          <h2>Risk Snapshot</h2>
          <div className="metrics-grid">
            {METRIC_CONFIG.map(([key, label, type]) => (
              <RiskMetricCard key={key} label={label} value={metrics[key]} type={type} />
            ))}
          </div>
        </section>
      ) : null}

      {beginnerInsights ? (
        <section className="panel">
          <h2>Beginner Insights</h2>
          <p className="insight-summary">
            Overall Risk: <strong>{beginnerInsights.riskLevel}</strong> | Return Quality: <strong>{beginnerInsights.sharpeQuality}</strong> | Market Behavior: <strong>{beginnerInsights.betaLevel}</strong> | Diversification: <strong>{beginnerInsights.diversification}</strong>
          </p>
          <div className="insight-grid">
            <div className="insight-card">
              <h4>VaR Meaning</h4>
              <p>Historical VaR is <strong>{formatPercent(metrics.historical_var)}</strong>. This is your expected one-day loss in a bad 5% scenario.</p>
            </div>
            <div className="insight-card">
              <h4>Sharpe Meaning</h4>
              <p>Sharpe ratio is <strong>{Number(metrics.sharpe_ratio || 0).toFixed(3)}</strong>. Higher is better because it means better return per unit risk.</p>
            </div>
            <div className="insight-card">
              <h4>Beta Meaning</h4>
              <p>Beta is <strong>{Number(metrics.beta || 0).toFixed(3)}</strong>. Values above 1 indicate stronger market swings than the benchmark.</p>
            </div>
            <div className="insight-card">
              <h4>Diversification</h4>
              <p>Average pair correlation is <strong>{beginnerInsights.avgCorr !== null ? Number(beginnerInsights.avgCorr).toFixed(3) : '--'}</strong>. Lower correlation generally improves diversification.</p>
            </div>
          </div>
          <h3>Suggested Actions</h3>
          <ul className="insight-list">
            {beginnerInsights.actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <CorrelationMatrix matrix={result?.correlation_matrix || null} />

      {result ? (
        <section className="panel">
          <h2>API Response</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  );
}

export default App;
