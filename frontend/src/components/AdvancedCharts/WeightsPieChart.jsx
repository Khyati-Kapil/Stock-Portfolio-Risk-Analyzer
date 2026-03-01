import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#8ecae6', '#219ebc', '#ffb703', '#fb8500', '#ff5d8f', '#56f196', '#8f7afe', '#ffd166'];

function WeightsPieChart({ holdings = [] }) {
  const data = useMemo(() => {
    const total = holdings.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    if (!total) return [];
    return holdings.map((item) => ({
      ticker: String(item.ticker || '').replace('.NS', ''),
      weight: (Number(item.weight || 0) / total) * 100,
    }));
  }, [holdings]);

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="ticker"
          outerRadius={86}
          innerRadius={45}
          cx="50%"
          cy="50%"
          label={({ ticker, weight }) => `${ticker} ${weight.toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={entry.ticker} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default WeightsPieChart;
