import { Resend } from "resend";

// Lazy singleton so missing key during build doesn't crash.
let _client = null;
function client() {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.MAIL_FROM || "Vera from Meglit Couture <meglit@meglitcouture.com>";
const REPLY_TO = process.env.MAIL_REPLY_TO || "support@meglitcouture.com";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReceiptHtml(order) {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const ref = order.reference || order.paymentReference || order.legacyId || order._id;

  const rows = items
    .map((it) => {
      const name = escapeHtml(it.name || "Item");
      const qty = Number(it.quantity) || 1;
      const price = Number(it.price) || 0;
      const line = price * qty;
      const meta = [it.size, it.color?.name || it.color]
        .filter(Boolean)
        .map((v) => escapeHtml(String(v)))
        .join(" · ");
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#111;">${name}</div>
            ${meta ? `<div style="font-size:12px;color:#666;margin-top:2px;">${meta}</div>` : ""}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;color:#555;">${qty}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;color:#111;">${NGN(line)}</td>
        </tr>`;
    })
    .join("");

  const subtotal = Number(order.subtotal) || items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
  const shipping = Number(order.shipping) || 0;
  const total = Number(order.total) || subtotal + shipping;

  const addr = customer.address
    ? `${escapeHtml(customer.address)}${customer.city ? ", " + escapeHtml(customer.city) : ""}${customer.state ? ", " + escapeHtml(customer.state) : ""}`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f4ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:32px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05);">
          <tr><td style="padding:32px 32px 16px;background:#1a1a1a;color:#fff;">
            <div style="font-size:22px;letter-spacing:.08em;font-weight:600;">MEGLIT COUTURE</div>
            <div style="font-size:13px;opacity:.7;margin-top:4px;">Order receipt</div>
          </td></tr>

          <tr><td style="padding:24px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
              Hi ${escapeHtml(customer.firstName || customer.name || "there")},
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
              Thank you for shopping with Meglit Couture. Your payment has been received and your order is being prepared.
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">Order reference</p>
            <p style="margin:0 0 16px;font-family:Menlo,Consolas,monospace;font-size:14px;color:#111;">${escapeHtml(ref)}</p>
          </td></tr>

          <tr><td style="padding:8px 32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1a1a1a;">
              <thead>
                <tr style="background:#fafafa;">
                  <th style="padding:10px 8px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em;">Item</th>
                  <th style="padding:10px 8px;text-align:center;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em;">Qty</th>
                  <th style="padding:10px 8px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em;">Total</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="padding:6px 8px;font-size:13px;color:#666;">Subtotal</td>
                <td style="padding:6px 8px;font-size:13px;text-align:right;color:#111;">${NGN(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;font-size:13px;color:#666;">Shipping</td>
                <td style="padding:6px 8px;font-size:13px;text-align:right;color:#111;">${shipping === 0 ? "Free" : NGN(shipping)}</td>
              </tr>
              <tr>
                <td style="padding:10px 8px;border-top:1px solid #eee;font-weight:700;font-size:15px;">Total paid</td>
                <td style="padding:10px 8px;border-top:1px solid #eee;font-weight:700;font-size:15px;text-align:right;">${NGN(total)}</td>
              </tr>
            </table>
          </td></tr>

          ${addr ? `
          <tr><td style="padding:16px 32px;background:#fafafa;">
            <p style="margin:0 0 4px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em;">Shipping to</p>
            <p style="margin:0;font-size:14px;color:#111;line-height:1.5;">
              ${escapeHtml(customer.firstName || "")} ${escapeHtml(customer.lastName || "")}<br>
              ${addr}
            </p>
          </td></tr>` : ""}

          <tr><td style="padding:24px 32px;">
            <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
              I'll personally make sure your order ships out promptly. If you have any questions, just reply to this email or reach us at
              <a href="mailto:support@meglitcouture.com" style="color:#1a1a1a;">support@meglitcouture.com</a>.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.6;">
              With love,<br>
              <strong>Vera</strong><br>
              <span style="color:#666;font-size:13px;">Meglit Couture</span>
            </p>
          </td></tr>

          <tr><td style="padding:16px 32px 24px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999;">
            © ${new Date().getFullYear()} Meglit Couture · meglitcouture.com
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function buildReceiptText(order) {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const ref = order.reference || order.paymentReference || order.legacyId || order._id;
  const subtotal = Number(order.subtotal) || 0;
  const shipping = Number(order.shipping) || 0;
  const total = Number(order.total) || 0;
  const lines = items.map((it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.price) || 0;
    return `  • ${it.name || "Item"} ×${qty}  ${NGN(price * qty)}`;
  });
  return [
    `Hi ${customer.firstName || customer.name || "there"},`,
    ``,
    `Thank you for your order at Meglit Couture. Your payment has been received.`,
    ``,
    `Reference: ${ref}`,
    ``,
    `Items:`,
    ...lines,
    ``,
    `Subtotal: ${NGN(subtotal)}`,
    `Shipping: ${shipping === 0 ? "Free" : NGN(shipping)}`,
    `Total paid: ${NGN(total)}`,
    ``,
    `Questions? Reply to this email or write to support@meglitcouture.com.`,
    ``,
    `With love,`,
    `Vera`,
    `Meglit Couture`,
  ].join("\n");
}

export async function sendOrderReceiptEmail(order) {
  const c = client();
  if (!c) {
    console.warn("[mail] RESEND_API_KEY not set — skipping receipt email");
    return { skipped: true };
  }
  const to = order?.customer?.email;
  if (!to) {
    console.warn("[mail] order has no customer.email — skipping receipt");
    return { skipped: true };
  }
  const ref = order.reference || order.paymentReference || order.legacyId || order._id;
  try {
    const result = await c.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `Your Meglit Couture order ${ref}`,
      html: buildReceiptHtml(order),
      text: buildReceiptText(order),
    });
    if (result.error) {
      console.error("[mail] resend error", result.error);
      return { error: result.error };
    }
    return { id: result.data?.id };
  } catch (err) {
    console.error("[mail] send failed", err);
    return { error: String(err?.message || err) };
  }
}

const INFO_INBOX = process.env.MAIL_INFO || "info@meglitcouture.com";

export async function sendContactMessageEmail({ name, email, phone, subject, message }) {
  const c = client();
  if (!c) return { skipped: true };
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : "";
  const safeSubject = escapeHtml(subject || "General Inquiry");
  const safeBody = escapeHtml(message).replace(/\n/g, "<br/>");
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;color:#1a1a1a;">New contact message</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#666;width:120px;">From</td><td style="padding:8px 0;">${safeName} &lt;${safeEmail}&gt;</td></tr>
        ${safePhone ? `<tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${safePhone}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#666;">Subject</td><td style="padding:8px 0;">${safeSubject}</td></tr>
      </table>
      <div style="margin-top:20px;padding:16px;background:#f7f5f1;border-radius:8px;line-height:1.6;">${safeBody}</div>
      <p style="margin-top:24px;font-size:12px;color:#888;">Reply directly to this email to respond to ${safeName}.</p>
    </div>
  `;
  const text = [
    `New contact message`,
    `From: ${name} <${email}>`,
    phone ? `Phone: ${phone}` : null,
    `Subject: ${subject || "General Inquiry"}`,
    ``,
    message,
  ].filter(Boolean).join("\n");
  try {
    const result = await c.emails.send({
      from: FROM,
      to: INFO_INBOX,
      replyTo: email,
      subject: `[Contact] ${subject || "General Inquiry"} — ${name}`,
      html,
      text,
    });
    if (result.error) return { error: result.error };
    return { id: result.data?.id };
  } catch (err) {
    return { error: String(err?.message || err) };
  }
}

function buildNewsletterHtml({ subject, bodyHtml, bodyText, unsubscribeUrl }) {
  const safeSubject = escapeHtml(subject);
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#faf8f3;padding:24px 0;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #ece7da;">
        <div style="background:#1a1a1a;color:#ffffff;padding:20px 24px;">
          <div style="font-size:20px;font-weight:bold;letter-spacing:0.08em;">MEGLIT</div>
          <div style="font-size:11px;letter-spacing:0.3em;color:#caa75a;text-transform:uppercase;margin-top:2px;">Couture</div>
        </div>
        <div style="padding:28px 24px;color:#1f1f1f;line-height:1.6;font-size:15px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">${safeSubject}</h1>
          ${bodyHtml || `<p>${escapeHtml(bodyText || "").replace(/\n/g, "<br/>")}</p>`}
        </div>
        <div style="padding:18px 24px;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center;">
          You're receiving this because you subscribed to Meglit Couture updates.<br/>
          ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color:#888;">Unsubscribe</a>` : ""}
        </div>
      </div>
    </div>
  `;
}

export async function sendNewsletterEmail({ to, subject, bodyHtml, bodyText, unsubscribeUrl }) {
  const c = client();
  if (!c) return { skipped: true };
  try {
    const result = await c.emails.send({
      from: process.env.MAIL_NEWSLETTER_FROM || `Meglit Couture <${INFO_INBOX}>`,
      to,
      replyTo: INFO_INBOX,
      subject,
      html: buildNewsletterHtml({ subject, bodyHtml, bodyText, unsubscribeUrl }),
      text: bodyText || subject,
    });
    if (result.error) return { error: result.error };
    return { id: result.data?.id };
  } catch (err) {
    return { error: String(err?.message || err) };
  }
}
