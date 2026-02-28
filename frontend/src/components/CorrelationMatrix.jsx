import React from 'react';

function CorrelationMatrix({ matrix }) {
    if (!matrix) return null;

    const tickers = Object.keys(matrix);

    if (tickers.length === 0) {
        return <div style={{ color: 'var(--text-tertiary)' }}>No correlation data.</div>;
    }

    const getColor = (value) => {
        if (value === 1) return 'rgba(255, 255, 255, 0.1)';
        if (value > 0.7) return 'rgba(0, 230, 118, 0.4)';
        if (value > 0.3) return 'rgba(0, 230, 118, 0.2)';
        if (value < -0.3) return 'rgba(255, 23, 68, 0.4)';
        if (value < 0) return 'rgba(255, 23, 68, 0.2)';
        return 'rgba(255, 255, 255, 0.05)';
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="correlation-table">
                <thead>
                    <tr>
                        <th></th>
                        {tickers.map(ticker => (
                            <th key={`thead-${ticker}`}>
                                {ticker.replace('.NS', '')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tickers.map(rowTicker => (
                        <tr key={`tr-${rowTicker}`}>
                            <td>{rowTicker.replace('.NS', '')}</td>
                            {tickers.map(colTicker => {
                                const val = matrix[rowTicker][colTicker];
                                return (
                                    <td key={`td-${rowTicker}-${colTicker}`}>
                                        <div className="cell-color" style={{
                                            background: getColor(val),
                                            padding: '4px 8px'
                                        }}>
                                            {val.toFixed(2)}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CorrelationMatrix;
