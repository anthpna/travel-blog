# Project Requirements — Tài liệu hướng dẫn đưa blog-trip lên GitHub & Deploy Web

> **Loại tài liệu:** Đặc tả yêu cầu (PM) cho một *deliverable dạng tài liệu*, không phải tính năng phần mềm.
> **Người lập:** Senior PM · **Ngày:** 2026-07-26 · **Trạng thái dự án:** 97% (63/65), build sạch, chưa deploy.

---

## 1. Tóm tắt

Người dùng yêu cầu một **tài liệu hướng dẫn (guide)** giúp:
1. Đưa mã nguồn dự án `blog-trip` lên **GitHub**.
2. Đưa website lên internet cho public truy cập.

### ⚠️ Điều chỉnh phạm vi quan trọng (đã chốt với người dùng)

Yêu cầu gốc nhắc tới **GitHub Pages (`*.github.io`)**. Tuy nhiên `blog-trip` là **ứng dụng Next.js 14 full-stack** (API Routes, NextAuth v5, Prisma + Supabase PostgreSQL, Sharp, ISR) — **không thể** chạy trên GitHub Pages vốn chỉ phục vụ file tĩnh.

→ **Quyết định:** Nền tảng deploy là **Vercel** (miễn phí tier Hobby, hỗ trợ đầy đủ SSR/API/DB/Auth). GitHub chỉ dùng để **host mã nguồn**. Đây là hướng đã được ghi trong workspace CLAUDE.md (Phase 8) và [docs/deploy.md](deploy.md).

---

## 2. Mục tiêu

| # | Mục tiêu | Đo lường |
|---|---|---|
| G1 | Người thực hiện (kể cả không chuyên) đưa được source lên GitHub an toàn (không lộ secret) | Repo tồn tại, không có `.env` trong lịch sử commit |
| G2 | Website chạy public trên Vercel với đầy đủ tính năng | URL `*.vercel.app` truy cập được, admin login OK |
| G3 | Tài liệu tự-đủ (self-contained), làm theo từng bước không cần hỏi thêm | Không có bước "mơ hồ"; mỗi lệnh copy-paste chạy được |

---

## 3. Đối tượng & Phạm vi

- **Đối tượng đọc:** Founder (Phan Thanh An) hoặc dev tiếp nhận — trình độ cơ bản về Git/terminal.
- **Trong phạm vi:** Chuẩn bị repo → push GitHub → cấu hình Supabase (DB + Storage) → biến môi trường → deploy Vercel → kiểm tra sau deploy.
- **Ngoài phạm vi:** GitHub Pages static export; custom domain nâng cao (chỉ nêu tuỳ chọn); CI/CD pipeline (thuộc `/secops`).

---

## 4. Danh sách User Stories (theo giai đoạn)

### Epic 1 — Đưa mã nguồn lên GitHub (Ưu tiên P0)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-1.1 | Là founder, tôi muốn **kiểm tra `.gitignore`** để không vô tình đẩy secret/ảnh local lên GitHub | Guide liệt kê rõ các entry bắt buộc: `.env`, `.env.local`, `public/uploads/`; có bước verify |
| US-1.2 | Là founder, tôi muốn **khởi tạo git & commit** lần đầu với hướng dẫn từng lệnh | Có block lệnh `git init/add/commit`; giải thích monorepo (`AI/` chứa nhiều project) |
| US-1.3 | Là founder, tôi muốn **tạo repo private trên GitHub và push** | Guide nêu rõ chọn **Private**; có lệnh `git remote add` + `git push`; cảnh báo không push nhầm cả workspace nếu không mong muốn |
| US-1.4 | Là founder, tôi muốn **checklist bảo mật** trước khi push | Có checklist: secret không commit, sinh `NEXTAUTH_SECRET` mới, xử lý token lộ (nếu có) |

### Epic 2 — Chuẩn bị hạ tầng Supabase (Ưu tiên P0)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-2.1 | Là founder, tôi muốn **apply DB migration** qua Supabase SQL Editor (tránh chặn IPv6) | Chỉ rõ đường dẫn file migration; các bước paste + verify bảng |
| US-2.2 | Là founder, tôi muốn **seed tài khoản admin** | Có hướng dẫn đổi `DATABASE_URL` sang pooler port 6543, chạy seed, khôi phục |
| US-2.3 | Là founder, tôi muốn **tạo 2 storage bucket** (`post-images` public, `submission-images` private) + RLS | Có SQL policy đầy đủ; nêu rõ bucket nào public/private |

### Epic 3 — Deploy lên Vercel (Ưu tiên P0)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-3.1 | Là founder, tôi muốn **bảng đầy đủ env vars** cần điền trên Vercel | Liệt kê tất cả biến (DATABASE_URL, SUPABASE_*, NEXTAUTH_*, ADMIN_EMAIL...) kèm nguồn lấy giá trị |
| US-3.2 | Là founder, tôi muốn **import repo vào Vercel & deploy** | Nêu rõ Root Directory = `blog-trip/` (do monorepo); Framework auto-detect Next.js |
| US-3.3 | Là founder, tôi muốn **cập nhật `NEXTAUTH_URL`** sau khi có domain Vercel + redeploy | Có bước điền URL thật rồi redeploy |
| US-3.4 | Là founder, tôi muốn **dọn dẹp** `SEED_*` vars sau khi seed xong | Checklist có bước xoá biến seed |

### Epic 4 — Kiểm tra & Bàn giao (Ưu tiên P1)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-4.1 | Là founder, tôi muốn **checklist QA sau deploy** | Bao phủ: homepage ISR, đổi ngôn ngữ, admin login, upload ảnh, map, comment flow, submission, sitemap, OG image |
| US-4.2 | Là founder, tôi muốn **bảng chi phí** để chọn tier phù hợp | Có ít nhất 2 tier (Free vs Recommended) kèm rủi ro DB auto-pause |
| US-4.3 | *(Tuỳ chọn)* Là founder, tôi muốn hướng dẫn **custom domain** | Nêu các bước Vercel Domains + cập nhật DNS + `NEXTAUTH_URL` |

---

## 5. Yêu cầu phi chức năng

| Loại | Yêu cầu |
|---|---|
| **Khả dụng (Usability)** | Mỗi bước có lệnh copy-paste chạy trực tiếp; đánh số thứ tự bắt buộc; ngôn ngữ tiếng Việt. |
| **Bảo mật (Security)** | Không đặt secret thật trong tài liệu (dùng placeholder); nhấn mạnh sinh `NEXTAUTH_SECRET` mới cho production; cảnh báo `/api/upload` chưa check auth. |
| **Bảo trì (Maintainability)** | Tài liệu tham chiếu (không sao chép trùng) [docs/deploy.md](deploy.md) đã có; chỉ bổ sung phần GitHub/onboarding còn thiếu. |
| **Chính xác (Accuracy)** | Số liệu (port pooler 6543, region Singapore, project id) khớp hiện trạng dự án. |

---

## 6. Tiêu chí nghiệm thu chung (Definition of Done)

- [ ] Tài liệu nêu rõ **lý do không dùng GitHub Pages** và chốt Vercel.
- [ ] Toàn bộ US-1.x → US-3.x có bước tương ứng, không thiếu bước nào chặn deploy.
- [ ] Một người làm theo tài liệu từ đầu đến cuối → website public chạy được.
- [ ] Không có secret thật bị ghi trong tài liệu.
- [ ] Có checklist QA sau deploy (US-4.1) và bảng chi phí (US-4.2).
- [ ] Tài liệu liên kết tới [docs/deploy.md](deploy.md) thay vì lặp lại.

---

## 7. Ghi chú bàn giao & Rủi ro

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Người dùng vẫn kỳ vọng `*.github.io` | Kỳ vọng lệch kết quả | Mục 1 giải thích rõ; đề xuất Vercel domain miễn phí thay thế |
| Push nhầm cả workspace `AI/` (chứa project khác + backlog) | Lộ dữ liệu ngoài ý muốn | US-1.3 cảnh báo; cân nhắc git init **trong** `blog-trip/` |
| Supabase Free auto-pause sau 7 ngày | Blog lỗi kết nối lúc ít traffic | Bảng chi phí khuyến nghị Tier B (Supabase Pro) |
| Token/secret có thể đã lộ trong repo khác của workspace | Bảo mật | Kiểm tra trước khi push; xem memory `project_auto_deploy` |

---

## 8. Bước tiếp theo

> Tài liệu **đặc tả** này đã sẵn sàng. Phần lớn nội dung kỹ thuật (Phase A→F, chi phí) **đã tồn tại** trong [docs/deploy.md](deploy.md).
>
> **Khoảng trống cần bổ sung** (giao cho `/dev`): phần onboarding GitHub chi tiết hơn cho người mới (US-1.1 → US-1.4) — đặc biệt xử lý tình huống **monorepo** (chỉ push thư mục `blog-trip/` hay cả workspace).
>
> 👉 Gợi ý chạy tiếp: **`/arch`** để chốt kiến trúc deploy & chiến lược repo (single vs monorepo), hoặc **`/dev`** để viết bản hướng dẫn thao tác hoàn chỉnh dựa trên đặc tả này.
