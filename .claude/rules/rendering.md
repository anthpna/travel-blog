# Rendering Strategy

## Bảng phân bổ theo route

| Route | Strategy | `revalidate` |
|---|---|---|
| `/posts/[slug]` | SSG + ISR | 3600 (1h) |
| `/`, `/posts` | ISR | 60 |
| `/destinations`, `/destinations/[slug]` | ISR | 300 |
| `/series`, `/series/[slug]` | ISR | 300 |
| `/tags/[tag]` | ISR | 300 |
| `/about` | Static | — |
| `/submit`, `/auth/login` | Static shell | — |
| `/admin/*` | CSR (client-only) | — |

## Quy tắc khi thêm route mới

- Route public mới mặc định ISR 300s trừ khi nội dung thay đổi thường xuyên.
- `/admin/*` pages: luôn là Client Components (`"use client"`), không cần `generateStaticParams` hay `revalidate`.
- Sau khi approve Submission → gọi `revalidatePath('/posts')` và `revalidatePath('/posts/[slug]', 'page')`.

## SSG cho post detail

`generateStaticParams` chỉ pre-render các post có `status: PUBLISHED`. Draft không được SSG.

## OG Image

`src/app/posts/[slug]/opengraph-image.tsx` là Edge Function — Next.js tự nhận và tạo endpoint. Không import bất kỳ Node.js-only module nào trong file này.
