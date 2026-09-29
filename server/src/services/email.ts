// Email service. Uses Resend when RESEND_API_KEY is set; otherwise logs to console
// so local development and unconfigured environments still work without crashing.
//
// All senders return { queued: boolean } instead of throwing — email failures
// should never break the app flow (orders, resets, etc.) that triggers them.
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'ADO Palmwinery <no-reply@adopalmwinery.com>';
const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'info@adopalmwinery.com';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const resend = apiKey ? new Resend(apiKey) : null;

async function send(to: string | string[], subject: string, html: string, replyTo?: string): Promise<{ queued: boolean }> {
  if (!resend) {
    console.log(`[email:stub] to=${to} subject="${subject}"`);
    return { queued: false };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html, replyTo });
    return { queued: true };
  } catch (err) {
    console.error('[email:send failed]', err);
    return { queued: false };
  }
}

// Minimal shared shell — inline styles because most email clients strip <style>.
function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fdf3d8;padding:32px 16px;color:#3a2413;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
    <h1 style="margin:0 0 20px;font-size:22px;color:#3a2413;">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
    <p style="font-size:12px;color:#888;margin:0;">ADO Palm Winery · Liberia, Costa Rica · info@adopalmwinery.com</p>
  </div></body></html>`;
}

function money(n: number, currency: string): string {
  return `${currency} ${Number(n).toFixed(2)}`;
}

// -------- Public senders --------

export function sendPasswordResetEmail(to: string, resetUrl: string) {
  const body = `
    <p>We received a request to reset your password.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:#3a2413;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Reset password</a></p>
    <p style="font-size:13px;color:#666;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    <p style="font-size:12px;color:#888;word-break:break-all;">${resetUrl}</p>
  `;
  return send(to, 'Reset your ADO Palm Winery password', shell('Reset your password', body));
}

type OrderItemLine = { name: string; quantity: number; price: number };

export function sendOrderConfirmationEmail(to: string, order: {
  id: string; total: number; subtotal: number; shippingCost: number; currency: string;
  items: OrderItemLine[]; guestOrder?: boolean;
}) {
  const rows = order.items.map(i =>
    `<tr><td style="padding:6px 0;">${i.name} <span style="color:#888;">× ${i.quantity}</span></td>
     <td style="padding:6px 0;text-align:right;">${money(i.price * i.quantity, order.currency)}</td></tr>`
  ).join('');
  const orderUrl = order.guestOrder
    ? `${CLIENT_URL}/order-confirmation/${order.id}`
    : `${CLIENT_URL}/orders`;
  const body = `
    <p>Thank you for your order — we'll email you again when it ships.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
      ${rows}
      <tr><td style="padding-top:12px;border-top:1px solid #eee;color:#666;">Subtotal</td>
          <td style="padding-top:12px;border-top:1px solid #eee;text-align:right;color:#666;">${money(order.subtotal, order.currency)}</td></tr>
      <tr><td style="color:#666;">Shipping</td>
          <td style="text-align:right;color:#666;">${money(order.shippingCost, order.currency)}</td></tr>
      <tr><td style="font-weight:700;padding-top:8px;">Total</td>
          <td style="text-align:right;font-weight:700;padding-top:8px;">${money(order.total, order.currency)}</td></tr>
    </table>
    <p><a href="${orderUrl}" style="display:inline-block;background:#3a2413;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">View order</a></p>
    <p style="font-size:13px;color:#666;">Order reference: ${order.id}</p>
    <p style="font-size:12px;color:#888;margin-top:20px;">An adult 18+ (21+ in the United States) with valid photo ID must be present to accept delivery.</p>
  `;
  return send(to, `Order confirmed — ${order.id.slice(0, 8)}`, shell('Order confirmed', body));
}

export function sendAdminNewOrderAlert(order: {
  id: string; total: number; currency: string; customerEmail: string; itemCount: number;
}) {
  const body = `
    <p><strong>New order</strong> — ${money(order.total, order.currency)}</p>
    <p>Customer: ${order.customerEmail}<br />Items: ${order.itemCount}<br />Order: ${order.id}</p>
    <p><a href="${CLIENT_URL}/admin/orders" style="display:inline-block;background:#3a2413;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Open admin</a></p>
  `;
  return send(ADMIN_EMAIL, `New order · ${money(order.total, order.currency)}`, shell('New order', body));
}

export function sendContactAutoReply(to: string, name: string) {
  const body = `
    <p>Hi ${name},</p>
    <p>Thanks for reaching out to ADO Palm Winery — we received your message and will get back to you shortly.</p>
    <p>For urgent questions you can also reach us on WhatsApp at +506 7157 7049.</p>
    <p>— The ADO Palm Winery team</p>
  `;
  return send(to, 'We received your message', shell('Thanks for contacting us', body));
}

export function sendAdminContactAlert(msg: { name: string; email: string; subject?: string; message: string }) {
  const body = `
    <p><strong>New contact form message</strong></p>
    <p><strong>From:</strong> ${msg.name} &lt;${msg.email}&gt;</p>
    ${msg.subject ? `<p><strong>Subject:</strong> ${msg.subject}</p>` : ''}
    <p style="white-space:pre-wrap;background:#f8f8f8;padding:12px;border-radius:8px;">${msg.message}</p>
  `;
  return send(ADMIN_EMAIL, `Contact form: ${msg.subject || msg.name}`, shell('Contact form', body), msg.email);
}
