export const metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: { title: "Client gallery", url: null },
  twitter: { title: "Client gallery" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
