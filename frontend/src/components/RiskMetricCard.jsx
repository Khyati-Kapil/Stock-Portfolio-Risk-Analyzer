import React from 'react';

function RiskMetricCard({ label, value, type = 'number' }) {
  const displayValue = (() => {
    if (value === null || value === undefined) {
      return '--';
    }
    if (type === 'percent') {
      return `${(Number(value) * 100).toFixed(2)}%`;
    }
    return Number(value).toFixed(4);
  })();

  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{displayValue}</div>
    </div>
  );
}

export default RiskMetricCard;
