import React, { useMemo } from 'react';

function classifyRisk(metrics, avgCorrelation) {
  const var95 = Number(metrics?.historical_var || 0);
  const sharpe = Number(metrics?.sharpe_ratio || 0);
  const beta = Number(metrics?.beta || 0);

  let score = 0;
  if (var95 >= 0.02) score += 2;
  else if (var95 >= 0.012) score += 1;

  if (sharpe < 0.5) score += 2;
  else if (sharpe < 1) score += 1;

  if (beta > 1.2) score += 1;
  if (avgCorrelation > 0.65) score += 1;

  if (score >= 5) return 'High';
  if (score >= 3) return 'Moderate';
  return 'Low';
}

function computeAverageCorrelation(matrix) {
  if (!matrix) return 0;
  const tickers = Object.keys(matrix);
  if (tickers.length < 2) return 0;

  let sum = 0;
  let count = 0;
  for (let i = 0; i < tickers.length; i += 1) {
    for (let j = i + 1; j < tickers.length; j += 1) {
      sum += Number(matrix[tickers[i]]?.[tickers[j]] ?? 0);
      count += 1;
    }
  }
  return count ? sum / count : 0;
}

function BeginnerInsights({ metrics, correlationMatrix }) {
  const insights = useMemo(() => {
    const var95 = Number(metrics?.historical_var || 0);
    const cvar = Number(metrics?.parametric_cvar || 0);
    const sharpe = Number(metrics?.sharpe_ratio || 0);
    const beta = Number(metrics?.beta || 0);
    const avgCorrelation = computeAverageCorrelation(correlationMatrix);
    const riskLevel = classifyRisk(metrics, avgCorrelation);

    const actions = [];

    if (var95 >= 0.02) {
      actions.push('Your downside risk is high. Reduce concentration in volatile stocks and cap single-stock exposure.');
    } else if (var95 >= 0.012) {
      actions.push('Downside risk is moderate. Keep position sizes disciplined and review stop-loss levels.');
    } else {
      actions.push('Downside risk is relatively low. Maintain current allocation discipline.');
    }

    if (sharpe < 0.5) {
      actions.push('Risk-adjusted return is weak. Rebalance away from low-conviction or underperforming positions.');
    } else if (sharpe < 1) {
      actions.push('Risk-adjusted return is average. Improve quality by trimming high-volatility, low-return holdings.');
    } else {
      actions.push('Risk-adjusted return is healthy. Continue periodic rebalancing to retain quality.');
    }

    if (beta > 1.2) {
      actions.push('Portfolio is aggressive vs market. Add defensive names or lower-beta assets to reduce shocks.');
    } else if (beta < 0.8) {
      actions.push('Portfolio is defensive vs market. You may underperform in strong rallies but lose less in drawdowns.');
    } else {
      actions.push('Market sensitivity is balanced. Current beta is close to benchmark behavior.');
    }

    if (avgCorrelation > 0.65) {
      actions.push('Diversification is weak. Many stocks are moving together; add lower-correlation sectors.');
    } else if (avgCorrelation > 0.35) {
      actions.push('Diversification is moderate. Consider adding one or two uncorrelated picks for stability.');
    } else {
      actions.push('Diversification is strong. Holdings are not overly moving in lockstep.');
    }

    return {
      riskLevel,
      avgCorrelation,
      var95,
      cvar,
      sharpe,
      beta,
      actions,
    };
  }, [metrics, correlationMatrix]);

  if (!metrics) return null;

  return (
    <div className="glass-card" style={{ marginTop: '1.5rem' }}>
      <h3 className="card-title">Beginner Analysis & Actions</h3>

      <div className="insight-summary-grid">
        <div className="insight-summary-item">
          <div className="metric-label">Overall Risk Level</div>
          <div className="metric-value">{insights.riskLevel}</div>
        </div>
        <div className="insight-summary-item">
          <div className="metric-label">VaR (95%)</div>
          <div className="metric-value">{(insights.var95 * 100).toFixed(2)}%</div>
        </div>
        <div className="insight-summary-item">
          <div className="metric-label">Expected Tail Loss (CVaR)</div>
          <div className="metric-value">{(insights.cvar * 100).toFixed(2)}%</div>
        </div>
        <div className="insight-summary-item">
          <div className="metric-label">Avg Correlation</div>
          <div className="metric-value">{insights.avgCorrelation.toFixed(2)}</div>
        </div>
      </div>

      <div className="insight-explain">
        <p>
          <strong>What this means:</strong> VaR estimates possible bad-day loss, Sharpe shows return quality per unit risk,
          beta shows market sensitivity, and correlation reveals diversification strength.
        </p>
      </div>

      <div className="insight-actions">
        <h4>Recommended Actions</h4>
        <ul>
          {insights.actions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default BeginnerInsights;
