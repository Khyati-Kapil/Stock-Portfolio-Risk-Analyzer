import React from 'react';

function TrendSignalPanel({ metrics }) {
    if (!metrics) return null;

    let recommendation = "HOLD";
    let colorClass = "badge-warning";

    if (metrics.sharpe_ratio > 1.2 && metrics.beta < 1.1) {
        recommendation = "STRONG BUY";
        colorClass = "badge-success";
    } else if (metrics.sharpe_ratio < 0.5 || metrics.beta > 1.5) {
        recommendation = "REDUCE EXPOSURE";
        colorClass = "badge-danger";
    } else if (metrics.sharpe_ratio > 0.8) {
        recommendation = "BUY";
        colorClass = "badge-success";
    }

    return (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title">AI Trend Signal</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>System Recommendation</div>
                    <div style={{ fontWeight: '700', fontSize: '1.4rem' }} className={`badge ${colorClass}`}>
                        {recommendation}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Confidence Score</div>
                    <div style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-primary)' }}>87.4%</div>
                </div>
            </div>
        </div>
    );
}

export default TrendSignalPanel;
