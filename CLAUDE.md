# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dự án

Travel blog song ngữ Việt/Anh. Founder: **Phan Thanh An** (sinh 1993).  
Kế hoạch chi tiết: [docs/plan-blog-trip.md](docs/plan-blog-trip.md).

**Tài liệu bổ sung:**
- [docs/technical.md](docs/technical.md) — Tech stack, kiến trúc, commands, links, env vars, deploy assessment
- [docs/status_logs.md](docs/status_logs.md) — Trạng thái phát triển, checklist theo phase, bug fixes, công việc tiếp theo
- [docs/testcase_logs.md](docs/testcase_logs.md) — Kết quả QA theo phase, FAIL/SKIP analysis
- [docs/deploy.md](docs/deploy.md) — Kế hoạch và các bước deploy **lần đầu** lên internet, phân tích chi phí
- [docs/push-deploy-guide.md](docs/push-deploy-guide.md) — Quy trình **lặp lại**: sửa code → push GitHub → deploy Vercel, rollback, xử lý sự cố
- [docs/usage-guide.md](docs/usage-guide.md) — Hướng dẫn sử dụng: seed admin (CLI/env), build & chạy container Docker

---

## Rule files tự động load

Claude Code tự load 7 rule files từ `.claude/rules/` khi làm việc trong repo này:

| File | Nội dung |
|---|---|
| `auth.md` | Middleware matcher, defense-in-depth, Supabase Service Role Key chỉ server-side |
| `bilingual.md` | Vi fields bắt buộc / En optional, LanguageToggle điều kiện, UI strings qua Context |
| `content-storage.md` | Dual storage: Tiptap JSON + HTML; `generateHTML` server-side; readingTime từ HTML Vi |
| `database.md` | Singleton Prisma client, slug package, Comment flow, Submission→Post transaction |
| `image-upload.md` | Sharp → WebP pipeline, bucket conventions (`post-images`/`submission-images`), 5MB limit |
| `leaflet.md` | Bắt buộc `next/dynamic ssr:false`, CSS trong component, marker icon fix |
| `rendering.md` | ISR revalidate per route, CSR cho `/admin/*`, SSG chỉ PUBLISHED posts |

> **Lưu ý `image-upload.md`**: Rule file mô tả Supabase Storage implementation — **ĐÃ IMPLEMENT** trong Phase 8. `src/lib/image-upload.ts` tự chọn Supabase Storage (khi `NEXT_PUBLIC_SUPABASE_URL` có giá trị) hoặc local filesystem fallback (dev không có creds). Bucket conventions trong rule file áp dụng đầy đủ.
