import Link from "next/link";
export default function Pagination({
  page,
  total,
  size = 48,
  path,
}: {
  page: number;
  total: number;
  size?: number;
  path: string;
}) {
  return total > size ? (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-6"
      aria-label="Pagination"
    >
      {page > 1 && (
        <Link className="btn" href={`${path}?page=${page - 1}`}>
          Previous
        </Link>
      )}
      <span>
        Page {page} of {Math.ceil(total / size)}
      </span>
      {page * size < total && (
        <Link className="btn" href={`${path}?page=${page + 1}`}>
          Next
        </Link>
      )}
    </nav>
  ) : null;
}
