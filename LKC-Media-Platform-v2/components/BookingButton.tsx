"use client";

export default function BookingButton({
    children = "Book a Shoot",
    className = "",
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    function openBooking() {
        window.dispatchEvent(
            new Event("open-booking")
        );
    }

    return (
        <button
            type="button"
            onClick={openBooking}
            className={className}
        >
            {children}
        </button>
    );
}