import Link from "next/link";
export default function PolicyLinks() {
  return (
    <nav
      aria-label="Policies"
      className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-3 px-5 py-8 text-sm text-slate-300"
    >
      {[
        ["/terms", "Terms"],
        ["/privacy", "Privacy"],
        ["/cancellation-rescheduling", "Cancellation / Rescheduling"],
        ["/photo-usage", "Photo Usage"],
      ].map(([href, label]) => (
        <Link key={href} href={href} className="hover:underline">
          {label}
        </Link>
      ))}
    </nav>
  );
}
