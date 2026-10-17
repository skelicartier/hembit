import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const localizedHomePaths = ['/in/en', '/us/en', '/uk/en', '/eu/en'];

const TICKER_ITEMS = [
  'MODERN CLOTHING WITH INTENTION',
  'DESIGNED IN INDIA',
  'BUILT TO ENDURE',
  'HB PRODUCTIONS — STORIES FROM THE HOUSE',
];

function Ticker() {
  return (
    <div className="footer-ticker" aria-hidden="true">
      <div className="footer-ticker-track">
        {[0, 1].map((pass) =>
          TICKER_ITEMS.map((item) => (
            <span key={`${pass}-${item}`}>{item}</span>
          ))
        )}
      </div>
    </div>
  );
}

function LocalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now.toISOString().slice(11, 19);

  return (
    <div className="footer-hud">
      <span className="footer-hud-dot" aria-hidden="true" />
      <span>UTC {time}</span>
    </div>
  );
}

export function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/' || localizedHomePaths.includes(location.pathname);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const subscribe = async (event) => {
    event.preventDefault();
    try {
      await api.post('/public/newsletter/subscribe', { email });
      setMessage('Subscribed successfully');
      setEmail('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <footer className={`site-footer ${isHome ? 'site-footer--home' : 'site-footer--compact'}`}>
      <div className="footer-inner">
        <Ticker />

        <div className="footer-main-grid">
          <div className="footer-col footer-brand-col">
            <p className={`footer-wordmark${isHome ? '' : ' footer-wordmark--compact'}`}>HEMBIT</p>
            <p className="footer-tagline">Modern clothing with intention</p>
          </div>

          <div className="footer-cols">
            <div className="footer-col footer-version-col">
              <RegionSelector />
            </div>

            <nav className="footer-links footer-col footer-links-main" aria-label="HEMBIT">
              <Link to="/our-story">ABOUT US</Link>
              <Link to="/founder-story">FOUNDER STORY</Link>
              <Link to="/services">SERVICES</Link>
              <Link to="/hb-productions">HB PRODUCTIONS</Link>
            </nav>

            <nav className="footer-links footer-col footer-links-legal" aria-label="Legal">
              <Link to="/privacy-policy">PRIVACY NOTICE</Link>
              <Link to="/terms-of-use">TERMS OF USE</Link>
            </nav>

            <form className="newsletter-form" onSubmit={subscribe}>
              <label htmlFor={isHome ? 'newsletter-home' : 'newsletter-compact'}>NEWSLETTER</label>
              <div>
                <input
                  id={isHome ? 'newsletter-home' : 'newsletter-compact'}
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">JOIN</button>
              </div>
              {message && <small>{message}</small>}
            </form>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-socials">
            <a href="https://www.instagram.com/hembit.in?igsh=MXNkajJ4cHp2b3FxMQ==" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/company/hembit/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://youtube.com/@hembit.support?si=YpujeB-XSrYQ7fX1" target="_blank" rel="noreferrer">YouTube</a>
          </div>
          <LocalClock />
          <p className="footer-copy">© {new Date().getFullYear()} HEMBIT</p>
        </div>
      </div>
    </footer>
  );
}

function RegionSelector() {
  return (
    <div className="footer-region-selector">
      <p className="footer-version">REGION / LANGUAGE</p>
      <nav aria-label="Region and language">
        <Link to="/in/en">INDIA / ENGLISH</Link>
        <Link to="/us/en">UNITED STATES / ENGLISH</Link>
        <Link to="/uk/en">UNITED KINGDOM / ENGLISH</Link>
        <Link to="/eu/en">EUROPE / ENGLISH</Link>
      </nav>
    </div>
  );
}
