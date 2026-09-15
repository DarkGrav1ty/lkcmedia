"use client";
import { useEffect, useRef } from "react";
export default function Dialog({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose: () => void;
  label: string;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const target = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      target?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close.current();
      }}
      className="lkc-dialog"
    >
      {children}
    </dialog>
  );
}
