import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const subscribe = async (event) => {
    event.preventDefault();
    try {
      await api.post('/public/newsletter/subscribe', { email });
      setMessage('SUBSCRIBED');
      setEmail('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <form className="footer-newsletter" onSubmit={subscribe}>
          <input
            type="email"
            placeholder="EMAIL"
            aria-label="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">JOIN</button>
          {message && <small>{message}</small>}
        </form>

        <div className="footer-line">
          <p className="footer-copy">© {new Date().getFullYear()} HEMBIT</p>

          <nav aria-label="Footer">
            <Link to="/our-story">ABOUT</Link>
            <Link to="/services">SERVICES</Link>
            <Link to="/hb-productions">HB PRODUCTIONS</Link>
            <Link to="/privacy-policy">PRIVACY</Link>
            <Link to="/terms-of-use">TERMS</Link>
          </nav>

          <nav aria-label="Social">
            <a href="https://www.instagram.com/hembit.in?igsh=MXNkajJ4cHp2b3FxMQ==" target="_blank" rel="noreferrer">INSTAGRAM</a>
            <a href="https://www.linkedin.com/company/hembit/" target="_blank" rel="noreferrer">LINKEDIN</a>
            <a href="https://youtube.com/@hembit.support?si=YpujeB-XSrYQ7fX1" target="_blank" rel="noreferrer">YOUTUBE</a>
          </nav>

          <nav aria-label="Region">
            <Link to="/in/en">IN</Link>
            <Link to="/us/en">US</Link>
            <Link to="/uk/en">UK</Link>
            <Link to="/eu/en">EU</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
