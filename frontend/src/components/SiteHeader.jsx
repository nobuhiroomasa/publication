import { Link } from 'react-router-dom';

export default function SiteHeader({ links = [], navOpen, onToggleNav }) {
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link className="brand" to="/">
          Sample Cafe
          <span>URBAN SLOW COFFEE</span>
        </Link>
        <nav className={`main-nav${navOpen ? ' open' : ''}`}>
          <ul>
            {links.map((link) => (
              <li key={link.path} className="nav-item">
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link className="nav-cta" to="/reservations">
          <i className="fas fa-calendar-alt" aria-hidden="true" />
          <span>席を予約</span>
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={navOpen}
          aria-label="メニューを開閉"
          onClick={onToggleNav}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
