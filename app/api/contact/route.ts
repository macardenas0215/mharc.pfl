import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { z } from "zod";
const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});
export async function POST(request: Request) {
  const reply = (message: string, status: number) =>
    Response.json(
      { message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return reply("This request origin is not allowed.", 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return reply("Send a JSON message.", 415);
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply("A message is required.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 20000) {
        await reader.cancel();
        return reply("Message is too large.", 413);
      }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return reply("Invalid message format.", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return reply(
      "Please check all fields: use a valid email and a message of 10–5000 characters.",
      400,
    );
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY,
    salt = process.env.CONTACT_RATE_LIMIT_SECRET,
    resendKey = process.env.RESEND_API_KEY,
    destination = process.env.CONTACT_TO_EMAIL,
    sender = process.env.CONTACT_FROM_EMAIL;
  const databaseConfigured = Boolean(url && key && salt);
  const emailConfigured = Boolean(resendKey && destination && sender);
  if (!databaseConfigured && !emailConfigured)
    return reply(
      "Contact messaging is not configured yet. Please add the email delivery settings, then restart the site.",
      503,
    );
  const { website: _website, ...message } = parsed.data;
  void _website;

  if (databaseConfigured) {
    const db = createClient(url!, key!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Vercel overwrites x-vercel-forwarded-for. On other hosts require a trusted proxy header.
    const ip = process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for")
      : request.headers.get(process.env.TRUSTED_IP_HEADER || "x-real-ip");
    if (process.env.NODE_ENV === "production" && !ip)
      return reply(
        "Messaging is temporarily unavailable. Please use the contact number.",
        503,
      );
    const hash = createHmac("sha256", salt!)
      .update(ip?.split(",")[0].trim() || "local-development")
      .digest("hex");
    const limit = await db.rpc("consume_contact_limit", { client_hash: hash });
    if (limit.error)
      return reply(
        "Messaging is temporarily unavailable. Your message was not saved.",
        503,
      );
    if (!limit.data)
      return Response.json(
        { message: "Too many messages. Please try again in 15 minutes." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    const { error } = await db.from("contact_messages").insert(message);
    if (error)
      return reply(
        "Unable to save your message. Please try again later or call me.",
        503,
      );
  }

  if (emailConfigured) {
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: sender,
          to: [destination],
          reply_to: [message.email],
          subject: `[Portfolio] ${message.subject}`,
          text: `New portfolio message\n\nFrom: ${message.full_name} <${message.email}>\nSubject: ${message.subject}\n\n${message.message}`,
        }),
      });
      if (emailResponse.ok)
        return reply(
          "Your message was sent to my inbox. Thank you for reaching out!",
          201,
        );
    } catch {
      // Keep the message in the private inbox and return a truthful notification failure.
    }
    return reply(
      databaseConfigured
        ? "Your message was saved, but the email notification failed. Please try again or use the contact links."
        : "The email notification failed. Please try again or use the contact links.",
      502,
    );
  }
  return reply("Your message has been saved. Thank you for reaching out!", 201);
}
