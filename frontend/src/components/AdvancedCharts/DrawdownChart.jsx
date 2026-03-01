import React, { useMemo } from 'react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function DrawdownChart({ drawdownSeries = {} }) {
  const data = useMemo(
    () => Object.entries(drawdownSeries)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, value]) => ({ date, drawdown: Number(value) * 100 })),
    [drawdownSeries]
  );

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <XAxis dataKey="date" minTickGap={26} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Drawdown']}
          contentStyle={{ background: '#10151e', border: '1px solid rgba(255,255,255,0.18)' }}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" />
        <Area type="monotone" dataKey="drawdown" stroke="#ff8ca7" fill="#ff496c" fillOpacity={0.35} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default DrawdownChart;
