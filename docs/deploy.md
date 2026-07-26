# Kế hoạch Deploy blog-trip lên Internet

## Context

Dự án blog-trip là travel blog song ngữ Việt/Anh, build với Next.js 14 App Router, PostgreSQL (Prisma), Supabase Storage, và NextAuth v5. Code đã hoàn thiện 97% (63/65 tính năng), `npm run build` sạch 0 lỗi. Hiện tại chưa deploy vì 3 blocker: migration Supabase chưa chạy, storage bucket chưa tạo, chưa push GitHub.

Mục tiêu: đưa dự án lên public internet với chi phí tối ưu.

---

## Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Code / Build | ✅ Sạch (0 TS error, 0 ESLint error) |
| Local dev | ✅ Hoạt động đầy đủ |
| Supabase project | ✅ Đã tạo (`hnhhjfdfvyxijawooxqw`, Singapore) |
| Supabase DB migration | ⏳ Chưa apply (IPv6 DNS block direct conn) |
| Supabase Storage buckets | ⏳ Chưa tạo |
| GitHub repo | ⏳ Chưa push |
| Vercel | ⏳ Chưa connect |

---

## Kiến trúc deploy (Vercel + Supabase)

```
Browser
  │
  ▼
Vercel Edge Network (CDN)
  │
  ├─ Static assets / ISR cache ── served instantly
  │
  └─ Serverless Functions (API routes, SSR)
       │
       ├─ Supabase PostgreSQL (Pooler: port 6543, IPv4)
       │    └─ Tables: User, Post, Destination, Series, Tag, Comment, Submission, Subscriber
       │
       └─ Supabase Storage
            ├─ post-images (public bucket)
            └─ submission-images (private bucket)
```

---

## Các bước thực hiện (theo thứ tự bắt buộc)

### Phase A — Chuẩn bị repo (local)

**A1. Kiểm tra .gitignore**
Đảm bảo các entry sau tồn tại trong `.gitignore`:
```
.env.local
.env
public/uploads/
```
Nếu thiếu `public/uploads/` → thêm vào (tránh commit ảnh local lên GitHub).

**A2. Push lên GitHub (private repo)**
```bash
cd blog-trip
git init   # nếu chưa có git
git add .
git commit -m "feat: initial production-ready build"
# Tạo repo private trên GitHub, sau đó:
git remote add origin https://github.com/<username>/blog-trip.git
git push -u origin main
```

---

### Phase B — Supabase Database

**B1. Apply migration qua SQL Editor** (bypass IPv6 issue)
1. Mở Supabase Dashboard → SQL Editor
2. Paste toàn bộ nội dung file:
   `prisma/migrations/20260508170939_init/migration.sql`
3. Chạy → verify bảng được tạo qua Table Editor

**B2. Seed admin user** (chạy từ local với pooler URL)
Tạm thời trong `.env`, đổi `DATABASE_URL` sang pooler:
```
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```
Rồi chạy:
```bash
npx prisma db seed
```
Sau khi seed xong → đổi lại `DATABASE_URL` về local.

---

### Phase C — Supabase Storage

**C1. Tạo bucket `post-images`** (public)
- Dashboard → Storage → New Bucket
- Name: `post-images`
- Public: **ON** (images cần URL public để hiển thị)

**C2. Tạo bucket `submission-images`** (private)
- Name: `submission-images`
- Public: **OFF** (ảnh user submit, server-side only)

**C3. Áp dụng RLS policies qua SQL Editor**
```sql
-- post-images: anon chỉ được đọc
CREATE POLICY "Public read post-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- post-images: chỉ service_role mới ghi được
CREATE POLICY "Service role write post-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'service_role');

-- submission-images: không ai đọc public (server-side only)
-- submission-images: chỉ service_role ghi
CREATE POLICY "Service role write submission-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submission-images' AND auth.role() = 'service_role');
```

---

### Phase D — Chuẩn bị environment variables cho Vercel

Lấy các giá trị từ Supabase Dashboard → Settings → API:

> ⚠️ **KHONG dan secret that (mat khau DB, service_role key, NEXTAUTH_SECRET) vao file nay** — file duoc git track. Chi dan truc tiep vao Vercel Dashboard. Cot "Gia tri" duoi day dung placeholder/ghi chu.

| Variable | Giá trị điền vào Vercel | Trạng thái |
|---|---|---|
| `DATABASE_URL` | **Transaction Pooler (port 6543)**: `postgresql://postgres.jvwxysbequdftyxqixar:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` — thay `<PASSWORD>` = mat khau DB da encode (`@`→`%40`). ⚠️ Vercel serverless PHAI dung pooler, KHONG dung ket noi truc tiep `db.<ref>...:5432`. | ⚠️ Sua lai |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jvwxysbequdftyxqixar.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_7v9Z4T-Bzmb0jX3U9NIs5g_lZmGuQmO` (publishable — public-safe) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔒 Secret key (`sb_secret_...`) — dan truc tiep vao Vercel, khong ghi vao file | ✅ (da co) |
| `NEXTAUTH_SECRET` | 🔒 Da sinh moi — dan truc tiep vao Vercel, khong ghi vao file | ✅ |
| `NEXTAUTH_URL` | *(để trống trước, điền sau khi Vercel cấp domain)* | ⏳ Sau deploy |
| `ADMIN_EMAIL` | `anthp.na@gmail.com` | ✅ |
| `RESEND_API_KEY` | *(để trống nếu chưa dùng email)* | ⏳ Tuỳ chọn |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | **KHONG can them vao Vercel** — admin da duoc seed tu local (B2 xong) | ✅ Bo qua |

---

### Phase E — Deploy lên Vercel

**E1. Connect GitHub → Vercel**
1. Vào vercel.com → Add New Project → Import Git Repository
2. Chọn repo `blog-trip`
3. Framework: Next.js (tự detect)
4. Root directory: `blog-trip/` (nếu repo gốc là monorepo `AI/`)
5. Điền tất cả env vars từ Phase D
6. Deploy

**E2. Cập nhật NEXTAUTH_URL**
- Sau khi deploy xong, Vercel cấp domain dạng `blog-trip-xxx.vercel.app`
- Vào Vercel → Settings → Environment Variables → thêm:
  - `NEXTAUTH_URL=https://blog-trip-xxx.vercel.app`
- Redeploy (trigger từ Vercel Dashboard)

**E3. *(Tuỳ chọn)* Custom domain**
- Vào Vercel → Settings → Domains → Add Domain
- Nhập domain đã mua (ví dụ `phanhanhan.com`)
- Cập nhật DNS tại registrar theo hướng dẫn của Vercel
- Cập nhật `NEXTAUTH_URL` về domain thật → Redeploy

**E4. Dọn dẹp sau khi seed xong**
- Xóa `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` khỏi Vercel env vars

---

### Phase F — Kiểm tra sau deploy

- [ ] Homepage load OK, hiển thị bài viết (ISR)
- [ ] Chuyển ngôn ngữ Vi/En hoạt động
- [ ] Admin login: `admin@blog-trip.local` / mật khẩu đã seed
- [ ] Tạo post mới với ảnh → ảnh upload lên Supabase Storage
- [ ] Map destinations hiển thị (React-Leaflet)
- [ ] Bình luận → pending → duyệt → hiển thị
- [ ] Submission form → ảnh upload lên `submission-images`
- [ ] Sitemap: `/sitemap.xml` trả về XML hợp lệ
- [ ] OG images: link share trên mạng xã hội hiển thị ảnh đúng

---

## Phân tích chi phí

### Tier A — Miễn phí (Không khuyến nghị cho production)

| Dịch vụ | Gói | Chi phí |
|---|---|---|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| Resend | Free (3,000 email/tháng) | $0 |
| Domain | dùng `*.vercel.app` | $0 |
| **Tổng** | | **$0/tháng** |

**Giới hạn & rủi ro:**
- ⚠️ **Supabase Free tự động pause sau 7 ngày không có traffic** → blog khởi động lại mất 2-3 giây, đôi khi lỗi kết nối
- Supabase Free: chỉ 500MB DB + 1GB Storage
- Vercel Hobby: function timeout 10s (đủ dùng cho blog)
- Không có daily backup
- **Phù hợp:** Demo / thử nghiệm, không dùng production thực sự

---

### Tier B — Cá nhân (Khuyến nghị ✅)

| Dịch vụ | Gói | Chi phí |
|---|---|---|
| Vercel | Hobby | $0/tháng |
| Supabase | Pro | $25/tháng |
| Resend | Free | $0/tháng |
| Domain .com | Namecheap/GoDaddy | ~$1.25/tháng ($15/năm) |
| **Tổng** | | **~$26/tháng (~650,000 VND)** |

**Supabase Pro $25/tháng bao gồm:**
- 8GB database storage
- 100GB file storage (WebP ~50-200KB → đủ cho ~500,000 ảnh)
- 250GB bandwidth
- **Không tự động pause** dù không có traffic
- Daily backup, lưu 7 ngày
- Email support

**Phù hợp cho:** Travel blog cá nhân, traffic < 50,000 visitor/tháng

---

### Tier C — Chuyên nghiệp / Scale

#### Option C1: Vercel Pro + Supabase Pro

| Dịch vụ | Gói | Chi phí |
|---|---|---|
| Vercel | Pro | $20/tháng |
| Supabase | Pro | $25/tháng |
| Resend | Free | $0/tháng |
| Domain | .com | ~$1.25/tháng |
| **Tổng** | | **~$46/tháng (~1,150,000 VND)** |

**Vercel Pro thêm:** function timeout 60s, 1TB bandwidth, Analytics đầy đủ, preview environments cho mọi PR.
**Phù hợp khi:** Traffic > 100,000 visitor/tháng hoặc cần team collaboration.

#### Option C2: VPS (Hetzner + Supabase)

| Dịch vụ | Spec | Chi phí |
|---|---|---|
| Hetzner CX22 (2 vCPU, 4GB RAM) | Next.js app | ~$6/tháng |
| Supabase Pro | DB + Storage | $25/tháng |
| Cloudflare | CDN + DNS Free | $0 |
| Domain | .com | ~$1.25/tháng |
| **Tổng** | | **~$32/tháng (~800,000 VND)** |

⚠️ Đòi hỏi quản lý server thủ công: SSL, PM2, nginx, security updates.

---

### Tóm tắt chi phí

```
Tier A (Free)         $0/tháng   ← Rủi ro DB pause, không khuyến nghị
Tier B (Recommended) $26/tháng   ← Best value cho personal blog ✅
Tier C1 (Pro)        $46/tháng   ← Khi scale > 100k visitor/tháng
Tier C2 (VPS)        $32/tháng   ← Rẻ hơn C1 nhưng tốn công DevOps
```

**Khuyến nghị: Bắt đầu với Tier B** — Vercel Hobby (free) + Supabase Pro ($25/tháng) + domain .com ($1.25/tháng).

---

## Checklist bảo mật trước khi push GitHub

- [ ] `.env.local` có trong `.gitignore` (không commit secrets)
- [ ] `public/uploads/` có trong `.gitignore` (không commit ảnh local)
- [ ] Sinh `NEXTAUTH_SECRET` mới cho production (`openssl rand -base64 32`)
- [ ] Đổi mật khẩu admin sau lần đăng nhập đầu tiên trên production
- [ ] Xóa `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` khỏi Vercel sau khi seed
- [ ] RLS policies Supabase Storage đã áp dụng (Phase C3)
- [ ] Lưu ý: `/api/upload` không check auth — chấp nhận ở launch, thêm rate limiting nếu bị spam sau

---

## Thứ tự thực hiện tóm tắt

```
A1 → A2          Chuẩn bị .gitignore + push GitHub
B1 → B2          Apply DB migration + seed admin (Supabase SQL Editor)
C1 → C2 → C3     Tạo storage buckets + RLS policies
D                 Tập hợp env vars
E1 → E2          Deploy Vercel + set NEXTAUTH_URL
[E3]              Custom domain (tuỳ chọn)
E4               Xóa SEED_* vars
F                 QA checklist sau deploy
```
