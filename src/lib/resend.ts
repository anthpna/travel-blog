import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function notifyAdminComment({
  postTitle,
  commenterName,
  content,
}: {
  postTitle: string
  commenterName: string
  content: string
}) {
  if (!resend || !process.env.ADMIN_EMAIL) return

  try {
    await resend.emails.send({
      from: 'Blog-Trip <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `[Blog-Trip] Bình luận mới: ${postTitle}`,
      html: `
        <h2 style="margin:0 0 16px">Có bình luận mới cần duyệt</h2>
        <p><strong>Bài viết:</strong> ${postTitle}</p>
        <p><strong>Người gửi:</strong> ${commenterName}</p>
        <p><strong>Nội dung:</strong></p>
        <blockquote style="border-left:4px solid #e5e7eb;padding-left:1rem;color:#6b7280;margin:0">${content}</blockquote>
        <p style="margin-top:1.5rem">
          <a href="${BASE_URL}/admin/comments" style="background:#111;color:#fff;padding:8px 18px;text-decoration:none;border-radius:6px;font-size:14px">
            Xem &amp; duyệt bình luận
          </a>
        </p>
      `,
    })
  } catch {
    // Email failure must not affect the API response
  }
}

export async function notifyAdminSubmission({
  authorName,
  authorEmail,
  titleVi,
}: {
  authorName: string
  authorEmail: string
  titleVi: string
}) {
  if (!resend || !process.env.ADMIN_EMAIL) return

  try {
    await resend.emails.send({
      from: 'Blog-Trip <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `[Blog-Trip] Bài gửi mới: ${titleVi}`,
      html: `
        <h2 style="margin:0 0 16px">Có bài viết mới cần duyệt</h2>
        <p><strong>Tiêu đề:</strong> ${titleVi}</p>
        <p><strong>Tác giả:</strong> ${authorName}</p>
        <p><strong>Email:</strong> ${authorEmail}</p>
        <p style="margin-top:1.5rem">
          <a href="${BASE_URL}/admin/submissions" style="background:#111;color:#fff;padding:8px 18px;text-decoration:none;border-radius:6px;font-size:14px">
            Xem &amp; duyệt bài gửi
          </a>
        </p>
      `,
    })
  } catch {
    // Email failure must not affect the API response
  }
}
