import React from 'react';

function NewsFeed({ tickers }) {
    if (!tickers || tickers.length === 0) return null;

    const newsItems = tickers.slice(0, 3).map((ticker, idx) => ({
        id: idx,
        title: `${ticker.replace('.NS', '')} releases unexpected earnings preview`,
        sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral',
        time: `${Math.floor(Math.random() * 5 + 1)}h ago`,
    }));

    return (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title">Live Market Sentiment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {newsItems.map(news => (
                    <div key={news.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{news.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>{news.time}</div>
                        </div>
                        <span className={`badge ${news.sentiment === 'Positive' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                            {news.sentiment}
                        </span>
                    </div>
                ))}
                {newsItems.length === 0 && <div style={{ color: 'var(--text-tertiary)' }}>No news detected.</div>}
            </div>
        </div>
    );
}

export default NewsFeed;
