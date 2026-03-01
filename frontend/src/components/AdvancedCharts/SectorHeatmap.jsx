import React, { useMemo } from 'react';
import styles from './ChartsDashboard.module.css';

function colorForReturn(value) {
  if (value > 0.05) return 'rgba(45, 212, 128, 0.65)';
  if (value > 0.01) return 'rgba(45, 212, 128, 0.45)';
  if (value < -0.05) return 'rgba(255, 83, 112, 0.68)';
  if (value < 0) return 'rgba(255, 83, 112, 0.45)';
  return 'rgba(255, 255, 255, 0.18)';
}

function SectorHeatmap({ holdings = {}, dailyReturns = {} }) {
  const data = useMemo(() => {
    const entries = Array.isArray(holdings) ? holdings : [];
    return entries.map((item) => {
      const ticker = String(item.ticker || '').toUpperCase();
      const weight = Number(item.weight || 0);
      const dates = Object.keys(dailyReturns).sort();
      const recent = dates.slice(-30).map((date) => Number(dailyReturns[date] || 0));
      const sum = recent.reduce((acc, val) => acc + val, 0);
      return {
        ticker,
        sector: 'Portfolio',
        weight,
        return30: sum,
      };
    });
  }, [holdings, dailyReturns]);

  if (!data.length) return null;

  return (
    <div className={styles.heatmap}>
      {data.map((item) => (
        <div
          key={item.ticker}
          className={styles.heatCell}
          style={{
            background: colorForReturn(item.return30),
            transform: `scale(${Math.max(0.9, Math.min(1.1, item.weight * 2 + 0.9))})`,
          }}
        >
          <div className={styles.cellTicker}>{item.ticker.replace('.NS', '')}</div>
          <div className={styles.cellMeta}>Sector: {item.sector}</div>
          <div className={styles.cellMeta}>30D Return: {(item.return30 * 100).toFixed(2)}%</div>
          <div className={styles.cellMeta}>Weight: {(item.weight * 100).toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

export default SectorHeatmap;
