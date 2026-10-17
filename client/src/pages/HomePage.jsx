import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';

const BAND_ITEMS = [
  'HEMBIT',
  'MODERN CLOTHING WITH INTENTION',
  'DESIGNED IN INDIA',
  'BUILT TO ENDURE',
];

const INDEX_TILES = [
  ['01', 'SHOP ALL', '/shop'],
  ['02', 'HB PRODUCTIONS', '/hb-productions'],
  ['03', 'SERVICES', '/services'],
  ['04', 'OUR STORY', '/our-story'],
];

function KineticBand({ items, outline = false }) {
  return (
    <div className={`kinetic-band${outline ? ' kinetic-band--outline' : ''}`} aria-hidden="true">
      <div className="kinetic-band-track">
        {[0, 1].map((pass) =>
          items.map((item, i) => <span key={`${pass}-${i}`}>{item}</span>)
        )}
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <h1 className="poster-title" aria-label="HEMBIT">
      {'HEMBIT'.split('').map((char, i) => (
        <span key={i} className="pl" style={{ '--i': i }} aria-hidden="true">
          {char}
        </span>
      ))}
    </h1>
  );
}

export function HomePage() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    api
      .get('/public/shop')
      .then((response) => setProducts((response.products || []).slice(0, 4)))
      .catch(() => setProducts([]));
  }, []);

  const wall = products || [];
  const wallCount = String(wall.length).padStart(2, '0');

  return (
    <div className="home-page">
      <section className="poster scanlines">
        <div className="poster-guides" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="poster-hud" data-reveal>
          <span>HEMBIT® — SYSTEM 2026</span>
          <span>STORE · ONLINE</span>
          <span>EST. MMXXI — INDIA</span>
        </div>

        <div className="poster-core">
          <p className="poster-eyebrow" data-reveal>
            MODERN CLOTHING WITH INTENTION
          </p>
          <Wordmark />
          <div className="poster-meta" data-reveal>
            <p className="poster-statement">
              A focused design language — expressive silhouettes, disciplined tailoring,
              quality treated as part of the design rather than an afterthought.
            </p>
            <div className="poster-actions">
              <Link to="/shop" className="vbtn vbtn--solid">ENTER SHOP →</Link>
              <Link to="/hb-productions" className="vbtn">HB PRODUCTIONS</Link>
            </div>
          </div>
        </div>

        <div className="poster-meta">
          <span className="poster-scroll">SCROLL</span>
          <span className="poster-note">SELECTED — WALL BELOW</span>
        </div>
      </section>

      <KineticBand items={BAND_ITEMS} outline />

      {wall.length > 0 && (
        <section className="wall-section">
          <header className="shop-head">
            <div className="shop-head-top">
              <span className="shop-head-label">SELECTED — WALL</span>
              <span className="shop-head-count">[{wallCount}]</span>
            </div>
            <h2>SELECTED</h2>
          </header>
          <div className="product-grid">
            {wall.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      <nav className="poster-index" aria-label="Index">
        {INDEX_TILES.map(([no, label, to]) => (
          <Link key={to} to={to} className="index-tile" data-reveal>
            <span className="index-tile-no">{no}</span>
            <span className="index-tile-label">{label}</span>
            <span className="index-tile-arrow">→</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
