"use client";

export function ConfirmationButton({ message, className, children, disabled, title, ariaLabel }: { message: string; className?: string; children: React.ReactNode; disabled?: boolean; title?: string; ariaLabel?: string }) {
  return <button type="submit" disabled={disabled} title={title} aria-label={ariaLabel} className={className} onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}>{children}</button>;
}
