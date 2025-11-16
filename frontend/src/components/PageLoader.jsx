export default function PageLoader({ hidden }) {
  const className = hidden ? 'page-loader hide' : 'page-loader';
  return (
    <div className={className} aria-hidden={hidden}>
      <div className="loader-content">
        <div className="loader-logo">
          <i className="fas fa-mug-hot" aria-hidden="true" />
        </div>
        <p className="loader-text">淹れたてのひとときを読み込み中...</p>
      </div>
    </div>
  );
}
