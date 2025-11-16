import { parseExtraInfo, formatDateTime } from '../lib/content.js';
import { LoadingSection } from '../components/StatusSection.jsx';

export default function AboutPage({ content, announcements = [] }) {
  if (!content) {
    return <LoadingSection message="ストーリーを読み込み中です。" />;
  }
  const extra = parseExtraInfo(content.extra_info);
  const teamMembers = extra.team ? extra.team.split(',').map((member) => member.trim()).filter(Boolean) : [];

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
          <h2>私たちのストーリー</h2>
          <p>{content.body}</p>
          <div className="info-block">
            <h3>コンセプト</h3>
            <p>{content.highlight}</p>
          </div>
        </div>
        <div className="story-card">
          <h3>スタッフ</h3>
          {teamMembers.length ? (
            <ul>
              {teamMembers.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          ) : (
            <p>お店を支える主なスタッフや、関わっている方々を紹介してください。</p>
          )}
        </div>
      </section>

      <section className="page-section container" data-animate>
        <header className="section-header">
          <h2>お知らせ・メディア掲載</h2>
          <p>メディア掲載、コラボ企画、最近のお知らせなどをこちらに掲載できます。</p>
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
      </section>
    </>
  );
}
