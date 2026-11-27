// Server-side rules for the contact form's direct delivery (app/api/contact/route.ts).
// The limits match the form's maxLength attributes; the browser validates first, and
// the server checks everything again because a request can bypass the page.

export const CONTACT_LIMITS = {
  name: 100,
  email: 160,
  phone: 30,
  subject: 150,
  message: 3000,
} as const;

// A submission sooner than this after the form appeared is treated as automated.
export const MIN_FILL_TIME_MS = 3000;
// More links than this in one message is treated as spam.
const MAX_LINKS = 3;

export type ContactMessage = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ValidationResult =
  | { ok: true; value: ContactMessage }
  | { ok: false; reason: "invalid"; fields: (keyof ContactMessage)[] }
  | { ok: false; reason: "spam" };

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE = /^[+\d\s().-]*$/;

// Control characters (including line breaks) never belong in one-line fields; in the
// message only tabs and line breaks are kept.
const oneLine = (value: string) =>
  value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const multiLine = (value: string) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .trim();

const text = (data: Record<string, unknown>, key: string) =>
  typeof data[key] === "string" ? (data[key] as string) : "";

// Checks a parsed JSON body. The honeypot ("website", hidden from people) must be
// empty, and the form must have been open for a few seconds.
export function validateContact(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") return { ok: false, reason: "invalid", fields: [] };
  const body = data as Record<string, unknown>;
  if (text(body, "website") !== "") return { ok: false, reason: "spam" };
  const elapsed = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;
  if (!(elapsed >= MIN_FILL_TIME_MS)) return { ok: false, reason: "spam" };

  const value: ContactMessage = {
    name: oneLine(text(body, "name")),
    email: oneLine(text(body, "email")),
    phone: oneLine(text(body, "phone")),
    subject: oneLine(text(body, "subject")),
    message: multiLine(text(body, "message")),
  };
  const fields: (keyof ContactMessage)[] = [];
  if (!value.name || value.name.length > CONTACT_LIMITS.name) fields.push("name");
  if (value.email.length > CONTACT_LIMITS.email || !EMAIL.test(value.email)) fields.push("email");
  if (value.phone.length > CONTACT_LIMITS.phone || !PHONE.test(value.phone)) fields.push("phone");
  if (value.subject.length > CONTACT_LIMITS.subject) fields.push("subject");
  if (!value.message || value.message.length > CONTACT_LIMITS.message) fields.push("message");
  if (fields.length) return { ok: false, reason: "invalid", fields };

  const links = `${value.subject} ${value.message}`.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > MAX_LINKS) return { ok: false, reason: "spam" };
  return { ok: true, value };
}

// "Portfolio enquiry from Alex Morgan", plus the visitor's subject when given (the same
// default as the mailto fallback).
export function contactSubject({ name, subject }: ContactMessage) {
  return `Portfolio enquiry from ${name}${subject ? `: ${subject}` : ""}`.slice(0, 200);
}

// Plain text only: nothing the visitor typed is ever interpreted as HTML.
export function contactText(message: ContactMessage, site: string) {
  return [
    `New message from the contact form on ${site}/contact`,
    "",
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    ...(message.phone ? [`Phone: ${message.phone}`] : []),
    ...(message.subject ? [`Subject: ${message.subject}`] : []),
    "",
    message.message,
    "",
    "—",
    `Reply to this email to answer ${message.name} directly.`,
  ].join("\n");
}
