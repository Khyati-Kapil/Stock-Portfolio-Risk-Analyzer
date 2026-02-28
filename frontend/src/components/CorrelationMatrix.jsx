import React from 'react';

function cellColor(value) {
  const v = Number(value);
  if (Number.isNaN(v)) {
    return '#ffffff';
  }
  if (v >= 0.75) {
    return '#b91c1c';
  }
  if (v >= 0.4) {
    return '#f97316';
  }
  if (v >= 0) {
    return '#facc15';
  }
  if (v >= -0.4) {
    return '#93c5fd';
  }
  return '#2563eb';
}

function textColor(value) {
  const v = Number(value);
  return v >= 0.4 || v <= -0.4 ? '#ffffff' : '#111827';
}

function CorrelationMatrix({ matrix }) {
  if (!matrix) {
    return null;
  }

  const cols = Object.keys(matrix);
  if (!cols.length) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Correlation Matrix</h2>
      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Asset</th>
              {cols.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cols.map((row) => (
              <tr key={row}>
                <th>{row}</th>
                {cols.map((col) => {
                  const value = Number(matrix[row][col]);
                  return (
                    <td
                      key={`${row}-${col}`}
                      style={{
                        background: cellColor(value),
                        color: textColor(value),
                        fontWeight: 600,
                      }}
                    >
                      {value.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CorrelationMatrix;
