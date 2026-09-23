"use client";
import Dialog from "./Dialog";
import { POLICY_VERSION } from "@/lib/site";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import AddressInput, { SelectedLocation } from "@/components/AddressInput";

export default function BookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [shootType, setShootType] = useState("Sports");

  const [location, setLocation] = useState<SelectedLocation | null>(null);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  useEffect(() => {
    function openBookingModal() {
      setSubmitted(false);
      setSubmitting(false);
      setSubmitError("");
      setLocation(null);
      setShootType("Sports");
      setIsOpen(true);
    }

    window.addEventListener("open-booking", openBookingModal);

    return () => {
      window.removeEventListener("open-booking", openBookingModal);
    };
  }, []);

  function closeModal() {
    if (submitting) {
      return;
    }

    setIsOpen(false);
    setSubmitted(false);
    setSubmitting(false);
    setSubmitError("");
    setLocation(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitError("");

    if (!location) {
      setSubmitError("Please select a location or enter it manually.");

      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const bookingRequest = {
      name: formData.get("name"),
      email: formData.get("email"),
      instagram: formData.get("instagram"),
      shootType: formData.get("shootType"),
      sport: formData.get("sport"),
      date: formData.get("date"),
      package: formData.get("package"),
      details: formData.get("details"),
      termsAccepted: formData.get("termsAccepted") === "on",
      mediaPolicyAccepted: formData.get("mediaPolicyAccepted") === "on",
      mediaConsent: formData.get("mediaConsent") === "on",
      policyVersion: POLICY_VERSION,

      location: {
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    try {
      setSubmitting(true);

      const response = await fetch("/api/bookings", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(bookingRequest),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send booking request.");
      }

      console.log("Booking saved:", result.bookingId);

      setSubmitted(true);
    } catch (error) {
      console.error("Booking submission error:", error);

      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog label="Book a shoot" onClose={closeModal}>
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1118] shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          disabled={submitting}
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Close booking form"
        >
          <X size={19} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10">
            {/* Header */}
            <div className="pr-12">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                LKC Media
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] sm:text-4xl">
                Book a Shoot
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
                Send me the details below and I'll get back to you about
                availability and the shoot.
              </p>
            </div>

            <div className="my-8 h-px bg-white/10" />

            {/* Name */}
            <div>
              <label
                htmlFor="booking-name"
                className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
              >
                Your Name *
              </label>

              <input
                id="booking-name"
                name="name"
                maxLength={120}
                type="text"
                required
                disabled={submitting}
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-[#0088ff] disabled:opacity-50"
              />
            </div>

            {/* Email + Instagram */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-email"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
                >
                  Email *
                </label>

                <input
                  id="booking-email"
                  name="email"
                  maxLength={254}
                  type="email"
                  required
                  disabled={submitting}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-[#0088ff] disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-instagram"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
                >
                  Instagram
                </label>

                <input
                  id="booking-instagram"
                  name="instagram"
                  type="text"
                  disabled={submitting}
                  placeholder="@username"
                  className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-[#0088ff] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Shoot Type */}
            <div className="mt-5">
              <label
                htmlFor="booking-type"
                className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
              >
                What Are We Shooting? *
              </label>

              <select
                id="booking-type"
                name="shootType"
                required
                disabled={submitting}
                value={shootType}
                onChange={(event) => {
                  setShootType(event.target.value);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition focus:border-[#0088ff] disabled:opacity-50"
              >
                <option value="Sports">Sports</option>

                <option value="Portraits">Portraits</option>
              </select>
            </div>

            {/* Sports Field */}
            {shootType === "Sports" && (
              <div className="mt-5">
                <label
                  htmlFor="booking-sport"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
                >
                  Sport / Team / Event
                </label>

                <input
                  id="booking-sport"
                  name="sport"
                  type="text"
                  disabled={submitting}
                  placeholder="Example: JV Football"
                  className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-[#0088ff] disabled:opacity-50"
                />
              </div>
            )}

            {/* Date */}
            <div className="mt-5">
              <label
                htmlFor="booking-date"
                className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
              >
                Date *
              </label>

              <input
                id="booking-date"
                name="date"
                type="date"
                min={today}
                required
                disabled={submitting}
                className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition focus:border-[#0088ff] disabled:opacity-50"
              />
            </div>

            {/* Location */}
            <div className="mt-5">
              <AddressInput
                onLocationChange={(selectedLocation) => {
                  setLocation(selectedLocation);

                  if (selectedLocation) {
                    setSubmitError("");
                  }
                }}
              />
            </div>

            {/* Package */}
            {shootType === "Sports" ? (
              <>
                <div className="mt-5">
                  <label
                    htmlFor="booking-package"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
                  >
                    Package
                  </label>

                  <select
                    id="booking-package"
                    name="package"
                    defaultValue=""
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition focus:border-[#0088ff] disabled:opacity-50"
                  >
                    <option value="">Select a package</option>

                    <option value="5 Edited Photos - $10">
                      5 Edited Photos — $10
                    </option>

                    <option value="10 Edited Photos - $25">
                      10 Edited Photos — $25
                    </option>

                    <option value="20 Edited Photos - $45">
                      20 Edited Photos — $45
                    </option>

                    <option value="30 Edited Photos - $55">
                      30 Edited Photos — $55
                    </option>

                    <option value="Full Game Coverage - $90">
                      Full Game Coverage — $90
                    </option>

                    <option value="Not Sure">Not sure yet</option>
                  </select>
                </div>
              </>
            ) : (
              <p className="mt-5 text-slate-300">
                Portrait sessions are quoted individually. Tell me what you have
                in mind.
              </p>
            )}
            {/* Details */}
            <div className="mt-5">
              <label
                htmlFor="booking-details"
                className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
              >
                Details *
              </label>

              <textarea
                id="booking-details"
                name="details"
                maxLength={4000}
                required
                disabled={submitting}
                rows={5}
                placeholder="Tell me what you're looking for..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-[#0088ff] disabled:opacity-50"
              />
            </div>

            <div className="mt-6 space-y-4 text-sm leading-6">
              <label className="flex items-start gap-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  name="termsAccepted"
                  required
                  disabled={submitting}
                />{" "}
                <span>
                  I accept the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="/cancellation-rescheduling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Cancellation / Rescheduling policy
                  </a>{" "}
                  and have read the{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Privacy policy
                  </a>
                  . These links open in a new tab.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  name="mediaPolicyAccepted"
                  required
                  disabled={submitting}
                />{" "}
                <span>
                  I accept the{" "}
                  <a
                    href="/photo-usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Photo Usage policy
                  </a>
                  . This does not grant promotional permission.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  name="mediaConsent"
                  disabled={submitting}
                />{" "}
                <span>
                  Optional: LKC Media may contact me about using selected photos
                  in its portfolio or social media. Any needed release will be
                  agreed separately.
                </span>
              </label>
            </div>
            {/* Error */}
            {submitError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full rounded-xl bg-[#0088ff] px-6 py-4 font-black transition hover:bg-[#0077df] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Booking Request →"}
            </button>

            <p className="mt-4 text-center text-xs text-white/30">
              Submitting this form does not automatically confirm the booking.
            </p>
          </form>
        ) : (
          /* Success */
          <div className="flex min-h-[480px] flex-col items-center justify-center p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0088ff]">
              <Check size={30} strokeWidth={3} />
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
              LKC Media
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">
              Request Sent.
            </h2>

            <p className="mt-4 max-w-md leading-7 text-white/50">
              Thanks! Your booking request has been received. I'll get back to
              you about availability and details.
            </p>

            <button
              type="button"
              onClick={closeModal}
              className="mt-8 rounded-full border border-white/15 px-6 py-3 font-bold transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
