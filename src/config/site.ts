/**
 * Cau hinh thuong hieu / dinh danh site.
 *
 * Moi chuoi ten site hien thi tren UI (navbar, footer, metadata, email, OG image)
 * deu lay tu day - KHONG hardcode o component. Doi ten site chi can sua 1 dong.
 */

// Ten site hien thi tren toan bo UI cong khai
export const SITE_NAME = 'Travel Blog'

// Ten tac gia / founder
export const SITE_AUTHOR = 'Phan Thanh An'

// Tieu de khu vuc quan tri (trang login + admin layout)
export const SITE_ADMIN_TITLE = `${SITE_NAME} Admin`

// Mo ta mac dinh dung cho metadata goc
export const SITE_DESCRIPTION =
  'Travel blog song ngữ Việt/Anh — chia sẻ hành trình, cảm xúc và những khoảnh khắc đáng nhớ bởi ' +
  SITE_AUTHOR +
  '.'

// Dia chi gui email he thong (Resend). Chi doi phan hien thi, dia chi giu nguyen.
export const SITE_EMAIL_FROM = `${SITE_NAME} <onboarding@resend.dev>`

// Tien to subject cua email he thong
export const SITE_EMAIL_SUBJECT_PREFIX = `[${SITE_NAME}]`
