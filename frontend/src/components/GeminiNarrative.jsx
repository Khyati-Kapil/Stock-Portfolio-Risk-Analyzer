import React, { useMemo } from 'react';
import styles from './GeminiNarrative.module.css';

const ORDER = ['Overall', 'Concerns', 'Diversification', 'Suggestions'];

function parseNarrative(text = '') {
  const content = String(text || '').trim();
  if (!content) return [];

  const markers = ORDER.map((name) => `${name}:`);
  const sections = [];

  markers.forEach((marker, index) => {
    const start = content.indexOf(marker);
    if (start === -1) return;

    let end = content.length;
    for (let j = index + 1; j < markers.length; j += 1) {
      const nextIndex = content.indexOf(markers[j], start + marker.length);
      if (nextIndex !== -1) {
        end = Math.min(end, nextIndex);
      }
    }

    const title = marker.replace(':', '');
    const body = content.slice(start + marker.length, end).trim();
    sections.push({ title, body });
  });

  if (sections.length) return sections;
  return [{ title: 'Analysis', body: content }];
}

function GeminiNarrative({ narrative, onRegenerate, isLoading = false }) {
  const sections = useMemo(() => parseNarrative(narrative), [narrative]);

  if (!sections.length) return null;

  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.header}>
        <h3 className="card-title" style={{ marginBottom: 0 }}>AI Risk Analysis</h3>
        <span className={styles.badge}>Gemini</span>
      </div>

      <div className={styles.sections}>
        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <p className={styles.sectionText}>{section.body}</p>
          </section>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.regenerate} onClick={onRegenerate} disabled={isLoading}>
          {isLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}

export default GeminiNarrative;
