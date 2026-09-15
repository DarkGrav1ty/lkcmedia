import { pageMetadata, CONTACT_EMAIL, POLICY_VERSION } from "@/lib/site";
export const metadata = pageMetadata("Photo Usage", "/photo-usage");
export default function Page() {
  return (
    <main className="page-shell policy">
      <h1>Photo Usage</h1>
      <p className="mt-4 text-slate-300">Policy version {POLICY_VERSION}</p>
      <section>
        <h2>Public previews and originals</h2>
        <p>
          Public gallery images are reduced-size, watermarked previews. Do not
          remove a preview watermark or treat a public preview as a licensed
          full-resolution download. Authorized client downloads provide the
          original stored file without adding a public-preview watermark.
        </p>
      </section>
      <section>
        <h2>Your permitted use</h2>
        <p>
          The rights included with delivered photos are those agreed in your
          session or delivery agreement. Request written permission for
          commercial use, resale, sublicensing or uses outside that agreement.
          Receiving a file does not by itself transfer copyright.
        </p>
      </section>
      <section>
        <h2>Portfolio and social media</h2>
        <p>
          Accepting this policy is separate from giving promotional permission.
          The optional booking checkbox permits a follow-up conversation about
          selected images; it is not a blanket model release. Any required
          permission for recognizable people, and parent or guardian
          authorization for minors, must be addressed before promotional
          publication.
        </p>
      </section>
      <section>
        <h2>Private galleries</h2>
        <p>
          Keep your gallery link and PIN with the intended recipients. Access
          and download permission can expire or be revoked. Anyone you give
          access to may retain downloaded copies, so share carefully.
        </p>
      </section>
      <section>
        <h2>Concerns and corrections</h2>
        <p>
          Contact LKC Media if a photo is incorrectly published, you have a
          privacy concern, or you need to clarify usage permission. Include the
          gallery link and enough detail to identify the image, without sending
          your PIN.
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
