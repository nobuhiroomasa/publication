import { LoadingSection } from '../components/StatusSection.jsx';

export default function GalleryPage({ gallery }) {
  if (!gallery) {
    return <LoadingSection message="ギャラリーを読み込み中です。" />;
  }
  const hasImages = gallery.length > 0;
  return (
    <>
      <section className="page-hero small" style={{ backgroundImage: "url('/static/images/gallery-banner.svg')" }} data-animate>
        <div className="container">
          <h1>ギャラリー</h1>
          <p>写真でお店の雰囲気や体験をお届けします。</p>
        </div>
      </section>
      <section className="page-section container" data-animate>
        {hasImages ? (
          <div className="masonry-grid">
            {gallery.map((image) => (
              <figure key={image.id} className="masonry-item">
                <img src={image.file_path} alt={image.caption || 'ギャラリー画像'} />
                {image.caption ? <figcaption>{image.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : (
          <p>ギャラリー画像はまだ登録されていません。</p>
        )}
      </section>
      <section className="page-section accent" data-animate>
        <div className="container">
          <h2>ビジュアルの活用アイデア</h2>
          <p>季節限定メニューやイベントの様子など、さまざまなストーリーを写真で発信してください。</p>
        </div>
      </section>
    </>
  );
}
