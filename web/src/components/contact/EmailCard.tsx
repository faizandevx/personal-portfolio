"use client";

import { useEffect, useRef, useState } from "react";
import CopyEmailButton from "@/components/contact/CopyEmailButton";
import { copyText } from "@/lib/clipboard";
import { PUBLIC_EMAIL } from "@/lib/site";

const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${PUBLIC_EMAIL}`;

// The Contact page's "Email me" card (design-reference/contact.html). A plain mailto
// link does nothing visible on computers without an email app, so the card is a button
// that opens a small list of email options: Gmail's web composer, the visitor's email
// app (mailto) and copying the address. It follows the disclosure pattern: the card
// says whether the list is open, Escape or a click elsewhere closes it, and the arrow
// keys move between the options. "Copy email" in the corner stays available.
export default function EmailCard() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const toggle = () => {
    setCopied("idle");
    setOpen((value) => !value);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) cardRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const options = [...(listRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [])];
    const index = options.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const next = index === -1 ? (step === 1 ? 0 : options.length - 1) : index + step;
    event.preventDefault();
    options[(next + options.length) % options.length]?.focus();
  };

  // Tabbing out of the card and its options closes the list.
  const onBlur = (event: React.FocusEvent) => {
    if (open && event.relatedTarget && !wrapRef.current?.contains(event.relatedTarget as Node))
      setOpen(false);
  };

  const copy = async () => {
    setCopied((await copyText(PUBLIC_EMAIL)) ? "copied" : "failed");
  };

  return (
    <div ref={wrapRef} className="contact-method-email" onBlur={onBlur} onKeyDown={onKeyDown}>
      <button
        ref={cardRef}
        aria-controls="email-options"
        aria-expanded={open}
        className="contact-method"
        type="button"
        onClick={toggle}
      >
        <span aria-hidden="true" className="method-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <rect height="14" rx="3" width="18" x="3" y="5"></rect>
            <path d="m4 7 8 6 8-6"></path>
          </svg>
        </span>
        <span className="method-copy">
          <span className="method-label">Email me</span>
          <strong>{PUBLIC_EMAIL}</strong>
        </span>
        <span aria-hidden="true" className="method-arrow">
          ↗
        </span>
      </button>
      <div
        ref={listRef}
        aria-label="Email options"
        className="email-options"
        hidden={!open}
        id="email-options"
        role="group"
      >
        <a
          href={GMAIL_COMPOSE_URL}
          rel="noopener noreferrer"
          target="_blank"
          onClick={() => close(false)}
        >
          Compose in Gmail <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href={`mailto:${PUBLIC_EMAIL}`} onClick={() => close(false)}>
          Open email application
        </a>
        <button type="button" onClick={copy}>
          {copied === "copied" ? "Email address copied" : "Copy email address"}
          {copied === "copied" && <span aria-hidden="true">✓</span>}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied === "copied" && "Email address copied."}
          {copied === "failed" && `Couldn't copy. The address is ${PUBLIC_EMAIL}.`}
        </span>
      </div>
      <CopyEmailButton />
    </div>
  );
}
