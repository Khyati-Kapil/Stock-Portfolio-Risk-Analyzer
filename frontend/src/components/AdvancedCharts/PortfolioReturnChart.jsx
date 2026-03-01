import React, { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function toCumulativeSeries(dailyReturns = {}, benchmarkReturns = {}) {
  const dates = Array.from(new Set([...Object.keys(dailyReturns), ...Object.keys(benchmarkReturns)])).sort();
  let p = 1;
  let b = 1;
  return dates.map((date) => {
    p *= 1 + Number(dailyReturns[date] ?? 0);
    b *= 1 + Number(benchmarkReturns[date] ?? 0);
    return {
      date,
      portfolio: (p - 1) * 100,
      benchmark: (b - 1) * 100,
    };
  });
}

function PortfolioReturnChart({ dailyReturns, benchmarkReturns }) {
  const data = useMemo(
    () => toCumulativeSeries(dailyReturns, benchmarkReturns),
    [dailyReturns, benchmarkReturns]
  );

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="date" minTickGap={26} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 11 }} />
        <Tooltip
          formatter={(value, key) => [`${Number(value).toFixed(2)}%`, key === 'portfolio' ? 'Portfolio' : 'Benchmark']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{ background: '#10151e', border: '1px solid rgba(255,255,255,0.18)' }}
        />
        <Line type="monotone" dataKey="portfolio" stroke="#56f196" strokeWidth={2.2} dot={false} />
        <Line type="monotone" dataKey="benchmark" stroke="#74c0fc" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PortfolioReturnChart;
