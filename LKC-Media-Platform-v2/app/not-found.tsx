import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-shell">
      <h1>Page not found</h1>
      <p className="mt-4">
        This link may be unavailable or no longer published.
      </p>
      <Link className="btn mt-6" href="/">
        Return home
      </Link>
    </main>
  );
}
