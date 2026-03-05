import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ROOMe <hello@roomeofficial.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://roomeofficial.com";

export async function sendFriendRequestEmail(toEmail: string, senderName: string) {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `${senderName} sent you a friend request on ROOMe`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">New friend request 👋</h2>
        <p style="color:#555;margin-bottom:24px"><strong>${senderName}</strong> sent you a friend request on ROOMe.</p>
        <a href="${APP_URL}/friends" style="display:inline-block;background:#38b6ff;color:#fff;font-weight:700;padding:12px 28px;border-radius:24px;text-decoration:none">View Request</a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">You're receiving this because you have friend request notifications enabled. <a href="${APP_URL}/profile/edit" style="color:#aaa">Manage preferences</a></p>
      </div>
    `,
  });
}

export async function sendFriendAcceptedEmail(toEmail: string, accepterName: string) {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `${accepterName} accepted your friend request on ROOMe`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">Friend request accepted ✓</h2>
        <p style="color:#555;margin-bottom:24px"><strong>${accepterName}</strong> accepted your friend request. You're now connected on ROOMe!</p>
        <a href="${APP_URL}/friends" style="display:inline-block;background:#38b6ff;color:#fff;font-weight:700;padding:12px 28px;border-radius:24px;text-decoration:none">View Friends</a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">You're receiving this because you have friend notifications enabled. <a href="${APP_URL}/profile/edit" style="color:#aaa">Manage preferences</a></p>
      </div>
    `,
  });
}

export async function sendMessageEmail(toEmail: string, senderName: string, preview: string) {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `New message from ${senderName} on ROOMe`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">New message 💬</h2>
        <p style="color:#555;margin-bottom:12px"><strong>${senderName}</strong> sent you a message:</p>
        <div style="background:#f4f4f5;border-radius:12px;padding:16px;color:#333;margin-bottom:24px">${preview}</div>
        <a href="${APP_URL}/messages" style="display:inline-block;background:#38b6ff;color:#fff;font-weight:700;padding:12px 28px;border-radius:24px;text-decoration:none">Reply</a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">You're receiving this because you have message notifications enabled. <a href="${APP_URL}/profile/edit" style="color:#aaa">Manage preferences</a></p>
      </div>
    `,
  });
}
