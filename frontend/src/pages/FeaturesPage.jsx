import { LoadingSection } from '../components/StatusSection.jsx';

export default function FeaturesPage({ content, features = [] }) {
  if (!content) {
    return <LoadingSection message="ハイライトを読み込み中です。" />;
  }
  return (
    <>
      <section className="page-hero" style={{ backgroundImage: `url('${content.image || ''}')` }} data-animate>
        <div className="container">
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
      </section>

      <section className="page-section container" data-animate>
        <div className="intro-card">
          <h3>今日の気分に寄り添う一杯を。</h3>
          <p>{content.body}</p>
        </div>
        <div className="feature-grid">
          <div className="grid">
            {features.map((feature) => (
              <div key={feature.id} className="feature-card">
                <i className={`fas ${feature.icon}`} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section accent" data-animate>
        <div className="container">
          <h2>ご活用アイデア</h2>
          <p>季節のおすすめや限定メニューなど、自由にカードを追加してブランドの世界観を伝えてください。</p>
        </div>
      </section>
    </>
  );
}
