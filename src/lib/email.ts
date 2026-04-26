interface EmailInput {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "48co <noreply@48co.app>";

export const EMAIL_ENABLED = !!RESEND_API_KEY;

export async function sendEmail(input: EmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log(`[email] Would send: to=${input.to} subject="${input.subject}"`);
    return { ok: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from || FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend error", error);
    return { ok: false, error };
  }
  const data = await res.json();
  return { ok: true, id: data.id };
}
