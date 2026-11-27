import { PUBLIC_EMAIL } from "@/lib/site";

// Contact form delivery settings, read on the server only (never NEXT_PUBLIC_, so they
// are never sent to the browser). See README, "Contact form delivery".
// - RESEND_API_KEY (required): turns direct delivery on. Without it the form opens the
//   visitor's email app (mailto), as before.
// - CONTACT_TO_EMAIL (optional): the inbox that receives messages; default PUBLIC_EMAIL.
// - CONTACT_FROM_EMAIL (optional): the sender; default Resend's shared address, which
//   needs no domain of our own.
// - RESEND_API_URL (optional, tests only): points the route at a mock provider.
export function contactDelivery() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    to: process.env.CONTACT_TO_EMAIL?.trim() || PUBLIC_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL?.trim() || "Portfolio Contact <onboarding@resend.dev>",
    apiUrl: process.env.RESEND_API_URL?.trim() || "https://api.resend.com/emails",
  };
}

// Whether the contact page shows the direct-delivery form. The page is prerendered, so
// this is decided at build time; on Vercel, redeploy after changing the variables.
export const isContactDeliveryConfigured = () => contactDelivery() !== null;
