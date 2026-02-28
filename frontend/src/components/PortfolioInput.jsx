import React from 'react';

function PortfolioInput({
  rows,
  onChangeRow,
  onAddRow,
  onRemoveRow,
  totalWeight,
  benchmark,
  onBenchmarkChange,
  period,
  onPeriodChange,
  onUpload,
  uploadMessage,
  error,
  loading,
  onAnalyze,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Portfolio Input</h2>
        <span className={`pill ${totalWeight === 100 ? 'pill-ok' : 'pill-warn'}`}>
          Total Weight: {totalWeight.toFixed(2)}
        </span>
      </div>

      <div className="holding-list">
        {rows.map((row, index) => (
          <div className="holding-row" key={`${index}-${row.ticker}`}>
            <input
              value={row.ticker}
              placeholder="Ticker (RELIANCE, TCS...)"
              onChange={(e) => onChangeRow(index, 'ticker', e.target.value)}
            />
            <input
              value={row.weight}
              type="number"
              placeholder="Weight"
              onChange={(e) => onChangeRow(index, 'weight', e.target.value)}
            />
            <button type="button" className="btn btn-ghost" onClick={() => onRemoveRow(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={onAddRow}>
          + Add Holding
        </button>
      </div>

      <div className="config-grid">
        <label>
          Benchmark
          <input value={benchmark} onChange={(e) => onBenchmarkChange(e.target.value)} />
        </label>
        <label>
          Lookback Period
          <select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
            <option value="3mo">3 months</option>
            <option value="6mo">6 months</option>
            <option value="1y">1 year</option>
            <option value="2y">2 years</option>
            <option value="5y">5 years</option>
          </select>
        </label>
        <label>
          Upload Screenshot (Optional)
          <input type="file" accept="image/*" onChange={onUpload} />
        </label>
      </div>

      {uploadMessage ? <p className="status status-ok">{uploadMessage}</p> : null}
      {error ? <p className="status status-error">{error}</p> : null}

      <div className="cta-row">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={onAnalyze}>
          {loading ? 'Analyzing...' : 'Analyze Portfolio'}
        </button>
      </div>
    </section>
  );
}

export default PortfolioInput;
