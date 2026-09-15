"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-shell">
      <h1>Temporarily unavailable</h1>
      <p className="mt-4">
        We could not load this page. Please try again shortly.
      </p>
      <button className="btn mt-6" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
