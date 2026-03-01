import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PIE_COLORS = ['#6b4cff', '#00bcd4', '#00e676', '#ffea00', '#ff9800', '#ff1744', '#90caf9'];

function normalizeWeights(holdings) {
  const total = holdings.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  if (!total) return [];
  return holdings.map((item) => ({
    ticker: String(item.ticker || '').replace('.NS', ''),
    weight: (Number(item.weight) / total) * 100,
  }));
}

function RiskCharts({ metrics, holdings }) {
  const riskBars = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Hist VaR', value: Number(metrics.historical_var || 0) * 100 },
      { name: 'Param VaR', value: Number(metrics.parametric_var || 0) * 100 },
      { name: 'CVaR', value: Number(metrics.parametric_cvar || 0) * 100 },
      { name: 'MC VaR', value: Number(metrics.monte_carlo_var || 0) * 100 },
    ];
  }, [metrics]);

  const weightData = useMemo(() => normalizeWeights(holdings || []), [holdings]);

  if (!metrics) return null;

  return (
    <div className="charts-grid" style={{ marginTop: '1.5rem' }}>
      <div className="glass-card">
        <h3 className="card-title">Risk Distribution Chart</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={riskBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" />
              <YAxis stroke="rgba(255,255,255,0.55)" unit="%" />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Value']}
                contentStyle={{ background: '#101014', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {riskBars.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="card-title">Portfolio Allocation</h3>
        <div style={{ width: '100%', height: 260 }}>
          {weightData.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={weightData}
                  dataKey="weight"
                  nameKey="ticker"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  innerRadius={45}
                  label={({ ticker, weight }) => `${ticker} ${weight.toFixed(0)}%`}
                >
                  {weightData.map((entry, index) => (
                    <Cell key={entry.ticker} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Add holdings to view allocation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiskCharts;
