export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="hero-label">Sample Cafe</p>
          <p>一杯ごとに、ちいさなひと休みを。</p>
        </div>
        <div>
          <p className="hero-label">Contact</p>
          <p>demo@example.com</p>
        </div>
        <div>
          <p className="hero-label">Admin</p>
          <a href="/admin/login">管理画面にログイン</a>
        </div>
      </div>
      <div className="container footer-meta">
        <span>© {new Date().getFullYear()} Sample Cafe</span>
        <span>React + Flask Demo</span>
      </div>
    </footer>
  );
}
