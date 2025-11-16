export function LoadingSection({ message }) {
  return (
    <section className="page-section container">
      <p>{message}</p>
    </section>
  );
}

export function ErrorSection({ message }) {
  return (
    <section className="page-section container">
      <h2>エラーが発生しました</h2>
      <p>{message}</p>
    </section>
  );
}
