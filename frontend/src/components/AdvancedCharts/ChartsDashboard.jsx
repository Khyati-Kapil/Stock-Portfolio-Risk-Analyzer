import React from 'react';
import PortfolioReturnChart from './PortfolioReturnChart';
import DrawdownChart from './DrawdownChart';
import RollingVolatilityChart from './RollingVolatilityChart';
import WeightsPieChart from './WeightsPieChart';
import ReturnDistributionChart from './ReturnDistributionChart';
import SectorHeatmap from './SectorHeatmap';
import styles from './ChartsDashboard.module.css';

function ChartPanel({ title, children, wide = false }) {
  return (
    <div className={`glass-card ${styles.panel} ${wide ? styles.panelWide : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      {children || <div className={styles.empty}>No data available.</div>}
    </div>
  );
}

function ChartsDashboard({ analysisData, holdings }) {
  if (!analysisData) return null;

  const {
    daily_returns: dailyReturns,
    benchmark_returns: benchmarkReturns,
    drawdown_series: drawdownSeries,
    rolling_volatility: rollingVolatility,
    metrics,
  } = analysisData;

  return (
    <section className={styles.grid}>
      <ChartPanel title="Cumulative Return vs Benchmark">
        <PortfolioReturnChart dailyReturns={dailyReturns} benchmarkReturns={benchmarkReturns} />
      </ChartPanel>

      <ChartPanel title="Portfolio Drawdown">
        <DrawdownChart drawdownSeries={drawdownSeries} />
      </ChartPanel>

      <ChartPanel title="30-Day Rolling Volatility">
        <RollingVolatilityChart rollingVolatility={rollingVolatility} />
      </ChartPanel>

      <ChartPanel title="Portfolio Weights">
        <WeightsPieChart holdings={holdings} />
      </ChartPanel>

      <ChartPanel title="Daily Return Distribution">
        <ReturnDistributionChart dailyReturns={dailyReturns} varThreshold={metrics?.historical_var || 0} />
      </ChartPanel>

      <ChartPanel title="Sector Heatmap" wide>
        <SectorHeatmap holdings={holdings} dailyReturns={dailyReturns} />
      </ChartPanel>
    </section>
  );
}

export default ChartsDashboard;
