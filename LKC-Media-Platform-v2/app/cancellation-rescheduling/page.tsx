import { pageMetadata, CONTACT_EMAIL, POLICY_VERSION } from "@/lib/site";
export const metadata = pageMetadata(
  "Cancellation / Rescheduling",
  "/cancellation-rescheduling",
);
export default function Page() {
  return (
    <main className="page-shell policy">
      <h1>Cancellation / Rescheduling</h1>
      <p className="mt-4 text-slate-300">Policy version {POLICY_VERSION}</p>
      <section>
        <h2>Requesting a change</h2>
        <p>
          Contact LKC Media as soon as you need to cancel or move a session.
          Include your name, original date and booking reference if available. A
          requested change is confirmed only when LKC Media replies with written
          confirmation.
        </p>
      </section>
      <section>
        <h2>Fees and payments</h2>
        <p>
          Cancellation fees, deposits, refunds and deadlines depend on the
          written session agreement you accepted. This website does not impose
          an additional cancellation fee or invent a refund schedule. Ask for
          any unclear terms before confirming your session.
        </p>
      </section>
      <section>
        <h2>Weather and event changes</h2>
        <p>
          If weather, venue access, safety concerns or an event schedule
          prevents the planned shoot, contact LKC Media to discuss another date
          or the options in your session agreement. A replacement date depends
          on mutual availability.
        </p>
      </section>
      <section>
        <h2>If LKC Media must reschedule</h2>
        <p>
          LKC Media will contact you to discuss the available options and any
          applicable payment arrangements under your written agreement. Keep
          that confirmation with your booking records.
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
