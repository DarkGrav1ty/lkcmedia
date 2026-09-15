import { pageMetadata, CONTACT_EMAIL, POLICY_VERSION } from "@/lib/site";
export const metadata = pageMetadata("Privacy", "/privacy");
export default function Page() {
  return (
    <main className="page-shell policy">
      <h1>Privacy</h1>
      <p className="mt-4 text-slate-300">Policy version {POLICY_VERSION}</p>
      <section>
        <h2>Information you provide</h2>
        <p>
          The booking form collects your name, email, optional Instagram handle,
          shoot type, sport or event, requested date, package preference,
          session details, venue and address. Selecting a location may also
          provide venue coordinates. The form records policy acceptance time,
          version and your optional photo-use contact preference.
        </p>
      </section>
      <section>
        <h2>How information is used</h2>
        <p>
          LKC Media uses this information to respond to requests, plan sessions,
          communicate with you and maintain booking records. The site sends
          booking information to its database provider, Supabase, and sends
          booking emails through Resend. Cloudflare hosts and delivers the
          website and may process technical request information.
        </p>
      </section>
      <section>
        <h2>Location searches and links</h2>
        <p>
          When you use address search, the text you type is sent to Photon,
          operated by komoot, to return location suggestions. You can enter your
          location manually instead. External links, including social media and
          Bible links, open services with their own privacy practices.
        </p>
      </section>
      <section>
        <h2>Cookies and security</h2>
        <p>
          Essential cookies keep an administrator signed in or remember
          authorized access to a private gallery. Private gallery cookies last
          up to one hour; access may end earlier. Admin sessions last up to 12
          hours. The application uses a keyed representation of your IP address
          to limit repeated requests. Hosting providers may also keep security
          logs. This version does not add advertising trackers or marketing
          analytics.
        </p>
      </section>
      <section>
        <h2>Photos and retention</h2>
        <p>
          Private galleries require an authorized PIN and may have an expiration
          date. Gallery expiration ends online access; it does not automatically
          delete retained originals or booking records. Downloaded copies cannot
          be remotely revoked. Records and images may be retained for service
          delivery, recovery and handling questions or obligations; contact LKC
          Media to request deletion or discuss retention.
        </p>
      </section>
      <section>
        <h2>Your requests</h2>
        <p>
          Email LKC Media to request access, correction or deletion of your
          booking information, or to raise a photo privacy concern. Identity or
          authority may need to be verified before responding. Parents or
          guardians should submit bookings for minors and contact LKC Media
          about information submitted by a child.
        </p>
      </section>
      <p className="mt-8">
        Contact:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    </main>
  );
}
