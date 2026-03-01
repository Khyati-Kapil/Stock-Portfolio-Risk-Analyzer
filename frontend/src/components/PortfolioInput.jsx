import React, { useEffect, useState } from 'react';
import { uploadPortfolioImage } from '../api/riskApi';
import { getErrorMessage } from '../utils/errorMessage';

function normalizeRows(rows) {
  return rows
    .map((row) => ({
      ticker: String(row.ticker || '').trim().toUpperCase(),
      weight: Number(row.weight),
    }))
    .filter((row) => row.ticker && Number.isFinite(row.weight) && row.weight > 0);
}

function PortfolioInput({ holdings, onUpdate }) {
  const [rows, setRows] = useState(
    holdings.length > 0
      ? holdings.map((h) => ({ ticker: h.ticker, weight: String(h.weight) }))
      : [
          { ticker: 'RELIANCE', weight: '50' },
          { ticker: 'TCS', weight: '30' },
          { ticker: 'INFY', weight: '20' },
        ]
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!holdings || holdings.length === 0) return;
    setRows(holdings.map((h) => ({ ticker: h.ticker, weight: String(h.weight) })));
  }, [holdings]);

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, { ticker: '', weight: '' }]);
  };

  const removeRow = (index) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const applyManualHoldings = () => {
    setError(null);
    setNotice(null);
    const normalized = normalizeRows(rows);
    if (!normalized.length) {
      setError('Please enter at least one valid ticker and weight.');
      return;
    }
    onUpdate(normalized);
    setNotice('Manual holdings applied. Click Analyze Risk.');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await uploadPortfolioImage(file);
      onUpdate(data);
      setNotice('Holdings extracted from screenshot. Review and click Analyze Risk.');
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'OCR parsing failed.'));
    } finally {
      setIsUploading(false);
    }
  };

  const totalWeight = rows.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);

  return (
    <div className="glass-card">
      <h3 className="card-title">Portfolio Input</h3>

      <div className="upload-section">
        <h4>1) Upload Screenshot</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          Upload a brokerage screenshot and auto-fill holdings with OCR + AI parsing.
        </p>

        <input
          type="file"
          accept="image/*"
          className="input-field"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span className="loader-spinner"></span> Extracting data using AI...
          </div>
        )}
      </div>

      <div className="manual-section">
        <div className="manual-header">
          <h4>2) Add Holdings Manually</h4>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-light)' }}>
            Total Weight: {totalWeight.toFixed(2)}
          </span>
        </div>

        {rows.map((row, idx) => (
          <div key={idx} className="holding-edit-row">
            <input
              className="input-field"
              value={row.ticker}
              onChange={(e) => updateRow(idx, 'ticker', e.target.value)}
              placeholder="Ticker (RELIANCE, TCS...)"
            />
            <input
              className="input-field"
              type="number"
              value={row.weight}
              onChange={(e) => updateRow(idx, 'weight', e.target.value)}
              placeholder="Weight"
            />
            <button type="button" className="btn" onClick={() => removeRow(idx)}>
              Remove
            </button>
          </div>
        ))}

        <div className="manual-actions">
          <button type="button" className="btn" onClick={addRow}>
            + Add Row
          </button>
          <button type="button" className="btn btn-primary" onClick={applyManualHoldings}>
            Apply Holdings
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ marginTop: '0.5rem', color: 'var(--color-success)', fontSize: '0.9rem' }}>
          {notice}
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      {holdings.length > 0 && !isUploading && (
        <div style={{ marginTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            Active Holdings ({holdings.length})
          </h4>
          <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {holdings.map((item, idx) => (
              <div key={idx} className="holding-item">
                <span className="holding-ticker">{item.ticker}</span>
                <span className="holding-weight badge" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-light)' }}>
                  {(item.weight * 100).toFixed(1)}% Weight
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioInput;
