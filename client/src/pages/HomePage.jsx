import { Link } from 'react-router-dom';

const LETTERS = ['H', 'E', 'M', 'B', 'I', 'T'];

export function HomePage() {
  return (
    <div className="home-page">
      <Link to="/shop" className="home-enter" aria-label="Enter HEMBIT shop">
        <h1 className="home-word" aria-label="HEMBIT">
          {LETTERS.map((char, i) => (
            <span key={char} className="hw-letter" style={{ '--i': i }} aria-hidden="true">
              {char}
            </span>
          ))}
        </h1>
        <span className="home-enter-hint">
          ENTER <span className="home-enter-arrow">→</span>
        </span>
      </Link>
    </div>
  );
}
