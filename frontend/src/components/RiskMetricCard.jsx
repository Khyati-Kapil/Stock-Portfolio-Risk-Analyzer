import React from 'react';

function RiskMetricCard({ metrics }) {
    if (!metrics) return null;

    const {
        historical_var,
        parametric_var,
        parametric_cvar,
        monte_carlo_var,
        sharpe_ratio,
        beta,
        alpha_annual
    } = metrics;

    return (
        <div className="glass-card">
            <h3 className="card-title">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Risk Analytics
            </h3>

            <div className="metrics-grid">
                <div>
                    <div className="metric-label">Historical VaR (95%)</div>
                    <div className="metric-value">{(historical_var * 100).toFixed(2)}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Max expected daily loss</div>
                </div>

                <div>
                    <div className="metric-label">Monte Carlo VaR</div>
                    <div className="metric-value">{(monte_carlo_var * 100).toFixed(2)}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>10-day horizon sim</div>
                </div>

                <div>
                    <div className="metric-label">Sharpe Ratio</div>
                    <div className="metric-value">{sharpe_ratio.toFixed(2)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {sharpe_ratio > 1 ? <span className="badge badge-success">Good</span> : <span className="badge badge-danger">Poor</span>}
                    </div>
                </div>

                <div>
                    <div className="metric-label">Portfolio Beta</div>
                    <div className="metric-value">{beta.toFixed(2)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Volatility vs Market</div>
                </div>
            </div>
        </div>
    );
}

export default RiskMetricCard;
