import { Link } from 'react-router-dom';
import { parseExtraInfo, formatDateTime } from '../lib/content.js';
import { LoadingSection } from '../components/StatusSection.jsx';

export default function HomePage({ content, features = [], gallery = [], announcements = [] }) {
  if (!content) {
    return <LoadingSection message="トップページを読み込み中です。" />;
  }
  const extra = parseExtraInfo(content.extra_info);
  const signature = extra.signature || '季節ごとに変わるおすすめメニューをご用意しています。';
  const highlightGallery = gallery.slice(0, 4);

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url('${content.image || ''}')` }} data-animate>
        <div className="hero-content container">
          <span className="hero-badge">Weekend Lounge</span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
          <div className="hero-highlight">{content.highlight}</div>
          <Link className="btn-primary" to="/reservations">
            席を予約する
          </Link>
        </div>
      </section>

      <section className="intro container">
        <div className="intro-text">
          <h2>おもてなしのデモサイト</h2>
          <p>{content.body}</p>
        </div>
        <div className="intro-card">
          <h3>おすすめの一杯・一皿</h3>
          <p>{signature}</p>
          <Link className="btn-outline" to="/highlights">
            おすすめを見る
          </Link>
        </div>
      </section>

      <section className="social-proof" data-animate>
        <div className="container">
          <header className="section-header">
            <h2>お知らせ</h2>
            <p>最新の営業情報やイベント情報などをこちらでご案内します。</p>
          </header>
          <div className="metrics">
            {[{ count: 680, label: '今月の保存数' }, { count: 120, label: 'UGCストーリー' }, { count: 48, label: 'コラボ投稿' }].map(
              (metric) => (
                <div key={metric.label} className="card">
                  <strong data-count={metric.count}>0</strong>
                  <span>{metric.label}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="feature-grid container" data-animate>
        <header className="section-header">
          <h2>ハイライト</h2>
          <p>お店らしさが伝わるポイントをご紹介します。</p>
        </header>
        <div className="grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <i className={`fas ${feature.icon}`} aria-hidden="true" />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="announcements" data-animate>
        <div className="container">
          <header className="section-header">
            <h2>News &amp; Journal</h2>
            <p>最新のイベントや限定メニューをチェックして、来店前からワクワクをシェア。</p>
          </header>
          <div className="announcement-grid">
            {announcements.map((item) => (
              <article key={item.id} className="announcement-card">
                <time dateTime={item.published_at}>{formatDateTime(item.published_at)}</time>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="insta-focus" data-animate>
        <div className="container">
          <div className="insta-header">
            <div>
              <p className="hero-label">Instagram Reels</p>
              <h2>Colorful Moments</h2>
            </div>
            <div className="insta-handle">
              <i className="fab fa-instagram" aria-hidden="true" />
              <span>@samplecafe</span>
            </div>
            <a className="btn-primary" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              フォローして最新情報を受け取る
            </a>
          </div>
          <div className="insta-grid">
            {highlightGallery.map((image) => (
              <div key={image.id} className="insta-card">
                <img src={image.file_path} alt={image.caption || 'Instagram highlight'} />
                <p>{image.caption || 'Daily mood'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-preview" data-animate>
        <div className="container">
          <header className="section-header">
            <h2>ギャラリー</h2>
            <p>店内の雰囲気やメニューの写真をご覧いただけます。</p>
          </header>
          <div className="gallery-grid">
            {gallery.map((image) => (
              <figure key={image.id}>
                <img src={image.file_path} alt={image.caption || 'ギャラリー画像'} />
                {image.caption ? <figcaption>{image.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
          <div className="cta-center">
            <Link className="btn-outline" to="/gallery">
              ギャラリーをもっと見る
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-banner" style={{ backgroundImage: "url('/static/images/cta.svg')" }}>
        <div className="overlay" />
        <div className="container">
          <h2>あなたのお店のコンセプト設計に。</h2>
          <p>このデモCMSを使って、ストーリーや見せ方を試しながら作り込めます。</p>
          <a className="btn-primary" href="/admin/login">
            管理画面にログイン
          </a>
        </div>
      </section>
    </>
  );
}
