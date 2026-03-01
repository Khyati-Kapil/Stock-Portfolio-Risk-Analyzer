import React from 'react';
import { useAuth } from '../auth/AuthContext';
import styles from './LandingPage.module.css';

const TICKS = [
  { symbol: 'AAPL', move: '+1.2%', up: true },
  { symbol: 'TSLA', move: '-0.8%', up: false },
  { symbol: 'INFY', move: '+0.4%', up: true },
  { symbol: 'HDFCBANK', move: '+1.1%', up: true },
  { symbol: 'NVDA', move: '+2.3%', up: true },
  { symbol: 'RELIANCE', move: '-0.6%', up: false },
  { symbol: 'MSFT', move: '+0.9%', up: true },
  { symbol: 'TCS', move: '+0.2%', up: true },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#EA4335" d="M9 3.48c1.69 0 2.84.73 3.49 1.35l2.54-2.48C13.46.89 11.4 0 9 0 5.48 0 2.44 2.02.96 4.96l2.95 2.29C4.62 5.16 6.62 3.48 9 3.48z"/>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71l2.91 2.26c1.7-1.57 2.68-3.89 2.68-6.61z"/>
      <path fill="#FBBC05" d="M3.91 10.75A5.41 5.41 0 0 1 3.62 9c0-.61.1-1.2.29-1.75L.96 4.96A8.98 8.98 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.95-2.29z"/>
      <path fill="#34A853" d="M9 18c2.4 0 4.41-.79 5.88-2.15l-2.91-2.26c-.81.54-1.84.87-2.97.87-2.38 0-4.38-1.68-5.09-3.93L.96 13.04C2.44 15.98 5.48 18 9 18z"/>
    </svg>
  );
}

function LandingPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <section className={styles.hero}>
          <div>
            <span className={styles.badge}>Bulls&Bears</span>
            <h1 className={styles.title}>Know Your Risk. Trade with Conviction.</h1>
            <p className={styles.subtitle}>
              Bulls&Bears helps you upload holdings, quantify downside, and get AI-backed risk interpretation before the market moves.
            </p>
            <button className={styles.googleBtn} onClick={login} disabled={isLoading}>
              <GoogleIcon />
              {isLoading ? 'Checking session...' : 'Sign in with Google'}
            </button>
          </div>

          <aside className={styles.heroCard}>
            <h3>Bulls&Bears Daily Brief</h3>
            <p>
              Real-time VaR, correlation stress, drawdown behavior, and personalized narrative analysis in one workflow.
            </p>
          </aside>
        </section>

        <section className={styles.features}>
          <article className={styles.featureCard}>
            <div>📸</div>
            <h4>Upload Screenshot</h4>
            <p>Extract holdings from brokerage screenshots and convert them into weighted portfolios.</p>
          </article>
          <article className={styles.featureCard}>
            <div>🧠</div>
            <h4>AI Analysis</h4>
            <p>Gemini-generated narrative explaining risk posture, weak spots, and actionable improvements.</p>
          </article>
          <article className={styles.featureCard}>
            <div>📊</div>
            <h4>Risk Metrics</h4>
            <p>VaR, CVaR, Sharpe, beta, drawdown, volatility trends, and sector-weight heat insights.</p>
          </article>
        </section>

        <div className={styles.tape}>
          <div className={styles.tapeInner}>
            {[...TICKS, ...TICKS].map((tick, i) => (
              <span className={styles.tick} key={`${tick.symbol}-${i}`}>
                <strong>{tick.symbol}</strong>
                <span className={tick.up ? styles.up : styles.down}>{tick.move}</span>
              </span>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <span>Institutional-grade risk clarity for everyday portfolios.</span>
          <span className={styles.aiPill}>Powered by Gemini AI</span>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
