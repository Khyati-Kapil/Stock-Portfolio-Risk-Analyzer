import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function histogram(values, bins = 20) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const counts = new Array(bins).fill(0);

  values.forEach((v) => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - min) / width)));
    counts[idx] += 1;
  });

  return counts.map((count, i) => {
    const left = min + i * width;
    const center = left + width / 2;
    return {
      bucket: center * 100,
      count,
    };
  });
}

function ReturnDistributionChart({ dailyReturns = {}, varThreshold = 0 }) {
  const values = useMemo(() => Object.values(dailyReturns).map((v) => Number(v)), [dailyReturns]);
  const data = useMemo(() => histogram(values, 24), [values]);
  const varPct = Number(varThreshold || 0) * -100;

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="bucket" tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <Tooltip
          formatter={(value) => [value, 'Days']}
          labelFormatter={(label) => `Return Bucket: ${Number(label).toFixed(2)}%`}
          contentStyle={{ background: '#10151e', border: '1px solid rgba(255,255,255,0.18)' }}
        />
        <ReferenceLine x={varPct} stroke="#ff5d8f" strokeWidth={2} label={{ value: 'VaR', fill: '#ff8ca7', fontSize: 11 }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.bucket} fill={entry.bucket < varPct ? '#ff496c' : '#3dd6ff'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ReturnDistributionChart;
