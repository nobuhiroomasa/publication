import { parseExtraInfo } from '../lib/content.js';
import { LoadingSection } from '../components/StatusSection.jsx';

export default function AccessPage({ content }) {
  if (!content) {
    return <LoadingSection message="アクセス情報を読み込み中です。" />;
  }
  const extra = parseExtraInfo(content.extra_info);
  const infoBlocks = Object.entries(extra);

  return (
    <>
      <section className="page-hero" style={{ backgroundImage: `url('${content.image || ''}')` }} data-animate>
        <div className="container">
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
      </section>

      <section className="page-section container two-column" data-animate>
        <div>
          <h2>ご来店案内</h2>
          <p>{content.body}</p>
          <div className="info-block">
            <h3>営業時間</h3>
            <p>{content.highlight}</p>
          </div>
          {infoBlocks.length ? (
            <div className="info-grid">
              {infoBlocks.map(([label, value]) => (
                <div key={label}>
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <h2>地図</h2>
          <div className="map-wrapper">
            <iframe
              title="Sample Cafe map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.897597392088!2d139.76712441557174!3d35.68123618019478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQwJzUzLjQiTiAxMznCsDQ2JzAxLjciRQ!5e0!3m2!1sja!2sjp!4v1615973912761!5m2!1sja!2sjp"
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="page-section accent" data-animate>
        <div className="container">
          <h2>アクセスのポイント</h2>
          <p>最寄り駅からの道順や目印、駐車場の有無など、ご来店に役立つ情報をこちらに記載してください。</p>
        </div>
      </section>
    </>
  );
}
