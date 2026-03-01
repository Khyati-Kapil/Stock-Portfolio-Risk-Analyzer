import React, { useMemo } from 'react';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function RollingVolatilityChart({ rollingVolatility = {} }) {
  const data = useMemo(
    () => Object.entries(rollingVolatility)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, value]) => ({ date, vol: Number(value) * 100 })),
    [rollingVolatility]
  );

  const avg = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((sum, item) => sum + item.vol, 0) / data.length;
  }, [data]);

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="date" minTickGap={26} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Rolling Volatility']}
          contentStyle={{ background: '#10151e', border: '1px solid rgba(255,255,255,0.18)' }}
        />
        <ReferenceLine y={avg} stroke="#ffd166" strokeDasharray="4 4" label={{ value: 'Avg', fill: '#ffd166', fontSize: 11 }} />
        <Line type="monotone" dataKey="vol" stroke="#00d0ff" strokeWidth={2.2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RollingVolatilityChart;
