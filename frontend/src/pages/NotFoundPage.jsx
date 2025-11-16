import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page-section container">
      <h1>ページが見つかりません</h1>
      <p>指定されたページは存在しないか、移動した可能性があります。</p>
      <Link className="btn-primary" to="/">
        ホームに戻る
      </Link>
    </section>
  );
}
