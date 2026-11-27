import { contactSubject, contactText, validateContact } from "@/lib/contact-message";
import { contactDelivery } from "@/lib/contact-delivery";
import { SITE_URL } from "@/lib/site";

// Direct delivery for the contact form: validates the message on the server and hands
// it to Resend's email API (https://resend.com/docs/api-reference/emails/send-email).
// The API key stays on the server. Nothing is stored. Without RESEND_API_KEY the route
// answers 503 and the page keeps its mailto form (see lib/contact-delivery.ts).

const MAX_BODY_BYTES = 10_000;
// Best-effort abuse limit per IP address: 5 messages per 10 minutes. It is kept in
// memory, so each server instance counts separately; Resend's daily quota is the hard cap.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string, now: number) {
  for (const [key, times] of recent) {
    const kept = times.filter((t) => now - t < WINDOW_MS);
    if (kept.length) recent.set(key, kept);
    else recent.delete(key);
  }
  const times = recent.get(ip) ?? [];
  if (times.length >= MAX_PER_WINDOW) return true;
  recent.set(ip, [...times, now]);
  return false;
}

// The Origin header can be "null" or malformed; that is never this site.
function originHost(origin: string | null) {
  try {
    return origin ? new URL(origin).host : null;
  } catch {
    return null;
  }
}

const reply = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const config = contactDelivery();
  if (!config) return reply(503, { error: "not_configured" });

  // Only this site's own pages may post here.
  const origin = originHost(request.headers.get("origin"));
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || origin !== host) return reply(403, { error: "forbidden" });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply(415, { error: "unsupported" });

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return reply(413, { error: "too_large" });
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return reply(400, { error: "invalid", fields: [] });
  }
  const result = validateContact(data);
  if (!result.ok)
    return result.reason === "spam"
      ? reply(400, { error: "rejected" })
      : reply(400, { error: "invalid", fields: result.fields });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip, Date.now())) return reply(429, { error: "rate_limited" });

  // The page sends one key per message, so a retry after a lost response is not sent twice.
  const key = (data as { submissionId?: unknown }).submissionId;
  const idempotencyKey =
    typeof key === "string" && /^[A-Za-z0-9-]{8,64}$/.test(key) ? key : undefined;

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: result.value.email,
        subject: contactSubject(result.value),
        text: contactText(result.value, SITE_URL),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const accepted =
      response.ok && typeof (await response.json().catch(() => null))?.id === "string";
    if (accepted) return reply(200, { ok: true });
    // Log the provider status only, never the visitor's message.
    console.error(`Contact delivery failed: provider status ${response.status}`);
    return reply(response.status === 429 ? 503 : 502, { error: "delivery_failed" });
  } catch (error) {
    console.error(`Contact delivery failed: ${error instanceof Error ? error.name : "error"}`);
    return reply(502, { error: "delivery_failed" });
  }
}
