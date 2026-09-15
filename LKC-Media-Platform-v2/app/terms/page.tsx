import { pageMetadata, CONTACT_EMAIL, POLICY_VERSION } from "@/lib/site";
export const metadata = pageMetadata("Terms", "/terms");
export default function Page() {
  return (
    <main className="page-shell policy">
      <h1>Terms</h1>
      <p className="mt-4 text-slate-300">Policy version {POLICY_VERSION}</p>
      <section>
        <h2>Booking requests</h2>
        <p>
          Submitting a request does not reserve a date or confirm a session. LKC
          Media will contact you to agree on availability, scope, location,
          price and delivery details. Any session-specific agreement must be
          accepted before the session is confirmed.
        </p>
      </section>
      <section>
        <h2>Prices and delivery</h2>
        <p>
          Published sports packages apply only to the services described.
          Portrait sessions require an individual quote. Any deposit, payment
          schedule, delivery date and included images will be stated in your
          written session agreement. Do not assume a fee or turnaround time that
          has not been agreed.
        </p>
      </section>
      <section>
        <h2>Access and permissions</h2>
        <p>
          Please arrange any required venue, team or event permission and tell
          LKC Media about relevant restrictions. A parent or legal guardian
          should handle booking and any required permission for a minor.
        </p>
      </section>
      <section>
        <h2>Using this website</h2>
        <p>
          Use only galleries and downloads you have been authorized to access.
          Do not guess other clients’ PINs, bypass access controls, redistribute
          gallery credentials or interfere with the service. Private access may
          expire or be revoked.
        </p>
      </section>
      <section>
        <h2>Changes and questions</h2>
        <p>
          The accepted policy version is recorded with your request. Later
          website updates do not automatically replace your session agreement.
          Contact LKC Media about questions, corrections or a written agreement
          that differs from this page.
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
