import { parseExtraInfo } from '../lib/content.js';
import { LoadingSection } from '../components/StatusSection.jsx';

export default function ReservationsPage({ content }) {
  if (!content) {
    return <LoadingSection message="予約情報を読み込み中です。" />;
  }
  const extra = parseExtraInfo(content.extra_info);
  const ctaLabel = extra.cta || '予約ページへ';
  const ctaLink = extra.link || '#';

  return (
    <>
      <section className="page-hero" style={{ backgroundImage: `url('${content.image || ''}')` }}>
        <div className="overlay" />
        <div className="container">
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
      </section>

      <section className="page-section container two-column">
        <div>
          <h2>ご予約案内</h2>
          <p>{content.body}</p>
          <div className="info-block">
            <h3>当店からのお約束</h3>
            <p>{content.highlight}</p>
          </div>
        </div>
        <div className="reservation-card">
          <h3>ご予約はこちら</h3>
          <a className="btn-primary" href={ctaLink} target="_blank" rel="noreferrer">
            {ctaLabel}
          </a>
          <p className="note">予約サイトやお問い合わせフォームへのリンクを設定してください。</p>
        </div>
      </section>

      <section className="page-section accent">
        <div className="container split">
          <div>
            <h2>貸切・団体予約について</h2>
            <p>
              貸切パーティー、テイスティング会、企業様のご利用など、団体予約に関するご案内や、ご希望に合わせたプラン内容をここにご記載ください。
            </p>
          </div>
          <div>
            <h2>ご予約時のお願い</h2>
            <ul className="bullet-list">
              <li>お席の時間制や事前のお預かり金などがある場合は、その内容を明記してください。</li>
              <li>キャンセル・人数変更の期限や方法についてわかりやすくご案内してください。</li>
              <li>アレルギーや記念日の演出など、事前にご相談いただきたい事項を記載すると安心です。</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
