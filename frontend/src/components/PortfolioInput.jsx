import React, { useState, useRef } from 'react';
import { uploadPortfolioImage } from '../api/riskApi';
import { getErrorMessage } from '../utils/errorMessage';

function PortfolioInput({ holdings, onUpdate }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const data = await uploadPortfolioImage(file);
            onUpdate(data);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "OCR parsing failed."));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="glass-card">
            <h3 className="card-title">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Upload Screenshot
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Upload an image of your portfolio. Our OCR will automatically parse your holdings.
            </p>

            <input
                type="file"
                accept="image/*"
                className="input-field"
                onChange={handleFileChange}
                disabled={isUploading}
                ref={fileInputRef}
            />

            {isUploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <span className="loader-spinner"></span> Extracting data using AI...
                </div>
            )}

            {error && <div className="error-text">{error}</div>}

            {holdings.length > 0 && !isUploading && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Detected Holdings ({holdings.length})</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {holdings.map((item, idx) => (
                            <div key={idx} className="holding-item">
                                <span className="holding-ticker">{item.ticker}</span>
                                <span className="holding-weight badge" style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid var(--border-light)'
                                }}>
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
