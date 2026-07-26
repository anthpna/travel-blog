# status_logs.md — Trạng thái phát triển blog-trip

**Cập nhật lần cuối:** 2026-05-15

## Tỉ lệ hoàn thành tổng thể

| Chỉ số | Giá trị |
|---|---|
| **Tỉ lệ hoàn thành** | **🟩 97% (63 / 65 tính năng)** |
| **Phases hoàn thành** | **8 / 8 code + local + UI polish** — Production deploy (Supabase buckets, migrate, Vercel) còn lại |
| **Test cases định nghĩa** | **115** (tester-blog-trip agent) |
| **Test cases pass (QA thủ công)** | **98 / 115** (85.2%) — 13 SKIP (9×P8 chưa deploy + 4×P3 thiếu data), 4 FAIL |
| **TypeScript errors** | 0 |
| **ESLint errors** | 0 |
| **npm run build** | ✅ 0 errors, 0 warnings |
| **Local dev** | ✅ Chạy hoàn toàn local — DB, images, auth, fonts đều OK |
| **Có thể deploy ngay?** | ⚠️ Gần rồi — cần tạo Supabase buckets + apply migration + Vercel |

---

## Checklist chức năng đầy đủ

### 🏗️ Phase 1 — Foundation & Auth ✅ Hoàn thành

- [x] Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- [x] Prisma v5 schema — 8 models, migration `20260508170939_init` applied
- [x] NextAuth v5 — JWT strategy, Credentials provider, `session.user.id` qua callbacks
- [x] Middleware bảo vệ `/admin/*` + `/api/submissions/:id/approve`
- [x] Defense-in-depth session check trong `/admin/layout.tsx`
- [x] Trang login `/auth/login` + Admin dashboard `/admin`
- [x] Seed script admin user (`node -r ts-node/register prisma/seed.ts`)

### ✏️ Phase 2 — Admin CRUD + Editor ✅ Hoàn thành

- [x] Tiptap editor — 2 tabs Vi/En, `viOnly` prop (cho /submit), toolbar, upload ảnh inline
- [x] Image upload pipeline: Sharp → resize 1920px → WebP 82% → `public/uploads/`
- [x] Post CRUD: tạo/sửa/xóa, slug Unicode tiếng Việt tự động
- [x] Reading time tự tính từ `contentHtmlVi` (`ceil(words/200)`, min 1 phút)
- [x] Dual content storage: `contentVi` (Tiptap JSON) + `contentHtmlVi` (HTML pre-rendered)
- [x] Destination CRUD (nameVi/En, country, lat/lng, slug, coverImage)
- [x] Series CRUD (titleVi/En, slug, description, coverImage)
- [x] `/admin/posts` — danh sách, filter DRAFT/PUBLISHED/ARCHIVED, toggle featured
- [x] `/admin/posts/new` + `/admin/posts/[id]/edit` — shared PostForm component
- [x] `/admin/destinations` + `/admin/series` — CRUD qua Dialog

### 🌐 Phase 3 — Public Blog & Bilingual ✅ Hoàn thành

- [x] LanguageContext — Vi/En toggle, no-flash (`localStorage` + inline `<script>` trước hydrate)
- [x] Navbar (language switch) + Footer (newsletter subscribe widget)
- [x] PostCard (size prop) + PostGrid (variant: asymmetric/standard)
- [x] Homepage — 3 sections magazine layout (ISR 60s), featured posts
- [x] `/posts` — danh sách + filter by tag (ISR 60s)
- [x] `/posts/[slug]` — SSG + ISR 3600s, `generateStaticParams` chỉ PUBLISHED
- [x] `opengraph-image.tsx` — dynamic OG image (`runtime: nodejs`, Prisma, fallback `og-default.jpg`)
- [x] `generateMetadata` — `og:title`, `og:description`, `og:image` per post
- [x] ShareButtons — Facebook Dialog API, Zalo share, Copy link + toast
- [x] SeriesNav — Prev/Next trong series theo `seriesOrder`
- [x] `/series` + `/series/[slug]` — timeline series (ISR 300s)
- [x] `/tags/[tag]` — bài theo tag (ISR 300s)

### 🗺️ Phase 4 — Destination Map ✅ Hoàn thành

- [x] `DestinationMap.tsx` — React-Leaflet v4, `next/dynamic ssr:false`, marker icon fix, CSS trong component
- [x] `/destinations` — full interactive map + grid (ISR 300s)
- [x] `/destinations/[slug]` — mini map non-interactive + posts grid (ISR 300s)
- [x] `/about` — mini map `dragging={false}` `zoomControl={false}` (250px height)
- [x] Marker files: `public/leaflet/marker-icon*.png` + `marker-shadow.png`

### 💬 Phase 5 — Comment System ✅ Hoàn thành

- [x] `POST /api/comments` — public, nhận `{ postId, name, content, email? }` → PENDING
- [x] Admin moderation: `PUT` → APPROVED/SPAM, `DELETE`
- [x] `CommentForm` + `CommentList` — chỉ render comment APPROVED trên public
- [x] `/admin/comments` — moderation table, filter by status
- [x] Email notify admin via Resend (graceful skip nếu `RESEND_API_KEY` rỗng)

### 📤 Phase 6 — User Submissions ✅ Hoàn thành

- [x] `/submit` — form public: tên, email, tiêu đề Vi, mô tả, ảnh bìa, TiptapEditor `viOnly`
- [x] `POST /api/submissions` → PENDING + email notify admin
- [x] `/admin/submissions` — danh sách + filter by status
- [x] `/admin/submissions/[id]` — review detail, approve/reject, admin notes, link post đã tạo
- [x] `POST /api/submissions/[id]/approve` — atomic transaction: tạo Post + set APPROVED + `revalidatePath`
- [x] `contentHtmlVi` được gen từ `generateHTML(contentVi)` khi approve; `readingTime` tính lại

### ℹ️ Phase 7 — About + SEO ✅ Hoàn thành

- [x] `/about` — Phan Thanh An (sinh 1993), bio, travel stats, mini Leaflet map
- [x] `app/sitemap.ts` — XML tự động: posts PUBLISHED + destinations + series
- [x] `app/robots.ts` — `Disallow: /admin/`, `Disallow: /api/`
- [x] `not-found.tsx` (global fallback) + `(public)/not-found.tsx` (404 có Navbar/Footer)
- [x] `error.tsx` — Error boundary toàn cục (client)
- [x] Loading skeletons cho posts, destinations, series, about
- [x] Newsletter subscribe — Footer widget + `/api/subscribe`

### 🐛 Phase 7.5 — Bug Fixes & QA ✅ Hoàn thành (2026-05-10)

- [x] OG image — fix `generateMetadata` không set `images:[]` khi không có coverImage
- [x] ESLint 0 errors — xóa `useRouter` unused trong admin submissions
- [x] `notFound()` trong `generateMetadata` — HTTP 404 propagate đúng khi có `loading.tsx`
- [x] `(public)/not-found.tsx` — **✅ TC-P7-12 FIXED**: import `<Navbar>` + `<Footer>` trực tiếp; 404 page render đầy đủ layout giống các trang public khác

### 🧪 QA Tooling ✅ Hoàn thành (2026-05-10)

- [x] `tester-blog-trip` agent — 115 test cases tự động, báo cáo PASS/FAIL/SKIP theo phase (`.claude/agents/tester-blog-trip.md`)

### 💻 Local Dev Setup ✅ Hoàn thành (2026-05-12)

- [x] **`.env.local`** — comment out 3 Supabase vars → `image-upload.ts` đi thẳng vào local filesystem, không attempt Supabase
- [x] **`.env`** — đổi `DATABASE_URL` về `localhost:5432/blog_trip`; thêm `SEED_ADMIN_*` vars (Prisma CLI chỉ đọc `.env`, không đọc `.env.local`)
- [x] **`src/lib/image-upload.ts`** — `uploadToLocal()`: submission-images thêm `{year}/{month}/` subfolder, nhất quán với post-images
- [x] **DB verified** — migration `20260508170939_init` applied, admin user `admin@blog-trip.local` đã tồn tại
- [x] **Dev server** — `npm run dev` → http://localhost:3000 ✅
- [x] **Prisma Studio** — `npx prisma studio` → http://localhost:5555 ✅

**Local image folder structure:**
```
public/uploads/
├── post-images/{year}/{month}/{uuid}.webp     →  /uploads/post-images/2026/05/abc.webp
└── submission-images/{year}/{month}/{uuid}.webp →  /uploads/submission-images/2026/05/abc.webp
```

### 🎨 UI & i18n Improvements ✅ Hoàn thành (2026-05-12)

- [x] **`public/site/`** — folder riêng cho assets website: `icons/` (favicon, logo SVG, UI icons) + `images/` (ảnh tĩnh website, không phải bài viết)
- [x] **Author avatar** — `src/app/(public)/about/AboutContent.tsx`: render `<Image src="/site/images/author.jpg">` với `onError` fallback về emoji gradient circle (file chưa có → fallback tự động)
- [x] **Font Roboto** — `src/app/layout.tsx`: thay Geist bằng `Roboto` từ `next/font/google` (`subsets: ['latin', 'vietnamese']`, variable `--font-roboto`); Tailwind fontFamily `sans` → Roboto
- [x] **Font Arial cho nội dung bài viết** — `src/app/globals.css`: `.post-body { font-family: Arial, Helvetica, sans-serif; }`; `src/components/blog/PostBody.tsx`: thêm class `post-body`
- [x] **Navbar dark slate** — `src/components/layout/Navbar.tsx`: `bg-slate-800 border-slate-700`; logo `text-white`; active links `bg-slate-600 text-white`; inactive `text-slate-300 hover:bg-slate-700`; lang button `border-slate-500 text-slate-200`
- [x] **i18n — `vi.ts`** — sửa `series.title: 'Chuỗi hành trình'`; thêm `post.viewOriginal` + `post.viewTranslation`
- [x] **i18n — `en.ts`** + **`en-base.ts`** — thêm `post.viewOriginal: 'Display original content'` + `post.viewTranslation: 'View translation'`; `Translations` interface trong `vi.ts` cập nhật
- [x] **`src/lib/detect-lang.ts`** — utility phát hiện ngôn ngữ gốc bài viết: đếm ký tự dấu tiếng Việt trong `titleVi`, nếu ratio ≥ 8% → `'vi'`, ngược lại → `'en'`
- [x] **`PostMetaClient.tsx`** (mới) — client component cho post header metadata: back link, destination badge, date (locale đúng vi-VN/en-US), reading time, tags — tất cả phản ánh ngôn ngữ UI hiện tại
- [x] **`PostBodyClient.tsx`** — thêm `originalLang` prop + state `showOriginal`; button "Hiển thị nội dung gốc" chỉ hiện khi bài có bản En VÀ ngôn ngữ gốc khác UI lang; reset khi đổi ngôn ngữ global
- [x] **`/posts/[slug]/page.tsx`** (RSC) — xóa hardcoded Vi strings; thay bằng `<PostMetaClient>` + `detectOriginalLang()`

### 🚀 Phase 8 — Deployment (Production) 🔶 Đang thực hiện

**Code đã xong (không cần sửa thêm):**
- [x] **`src/lib/image-upload.ts`** → Supabase Storage — tự chọn Supabase hoặc local fallback qua `NEXT_PUBLIC_SUPABASE_URL`
- [x] **`src/lib/supabase.ts`** — Supabase admin client (service role key)
- [x] **`src/app/layout.tsx`** — `metadataBase` từ `NEXTAUTH_URL` (fix OG image URL trên production)
- [x] **`npm run build`** — 0 errors, 0 warnings ✅

**Infrastructure còn lại (cần thực hiện thủ công):**
- [ ] **Tạo Supabase Storage buckets** 🔴 — `post-images` (public) + `submission-images` (private)
- [ ] **`prisma migrate deploy`** 🔴 — apply migration lên Supabase cloud DB *(bị block: DB chỉ có IPv6)*
- [ ] **`prisma db seed`** 🟡 — tạo admin user trên production DB (sau khi migrate xong)
- [ ] **Vercel deploy** 🟡 — connect GitHub repo + set env vars + deploy
- [ ] **E2E test production** 🟢 — chạy `tester-blog-trip` agent với production URL (TC-P8-*)

### 🌐 Phase 9 — i18n Full Coverage + DB Cleanup ✅ Hoàn thành (2026-05-15)

**i18n — translation keys mới (`vi.ts` / `en.ts` / `en-base.ts`):**
- [x] **`post.all`** — "Tất cả" / "All" (chip lọc trên `/posts`)
- [x] **`submit.*` (24 keys)** — toàn bộ UI strings cho `/submit`: tiêu đề trang, labels, hints, errors, success messages

**i18n — components đã fix:**
- [x] **`SubmitForm.tsx`** — dùng `useLang()`, tất cả 25+ strings hardcoded → `t.submit.*`; h1 + description đã chuyển từ `page.tsx` (RSC) vào đây (Client Component)
- [x] **`submit/page.tsx`** — simplified, chỉ còn metadata + `<SubmitForm />`
- [x] **`CommentList.tsx`** — locale date hardcoded `'vi-VN'` → dynamic `lang === 'en' ? 'en-US' : 'vi-VN'`
- [x] **`PostGrid.tsx`** — convert thành Client Component; empty message dùng `t.post.noPostsFound` thay hardcoded Vietnamese

**i18n — RSC listing pages (pattern: RSC data fetch → pass props → Client Component render):**
- [x] **`PostsFiltersClient.tsx`** (mới) — h1, "Tất cả" chip, tag names (nameEn khi EN mode), active filter description, post count
- [x] **`SeriesListClient.tsx`** (mới) — h1, subtitle, card titles song ngữ, post count
- [x] **`DestinationsClient.tsx`** (mới) — h1, subtitle, map loading, destination names song ngữ, post count
- [x] **`series/page.tsx`** + **`destinations/page.tsx`** — chỉ còn data fetching + pass serializable props sang client wrapper

**DB cleanup:**
- [x] **6 PUBLISHED test posts → DRAFT** — không còn hiển thị trên public blog (`/posts`, homepage)
- [x] **Sửa garbled Vietnamese titles** — encoding issues trong 3 posts (`B…i...`, `H… N?i...`) → UTF-8 đúng
- [x] **`npm run build`** — 0 errors, 0 warnings sau tất cả thay đổi ✅

### 🐛 Bug Fixes — 2026-05-15

- [x] **`LanguageContext.tsx` — hydration mismatch fix**: `useState(readInitialLang)` → `useState('vi')` + `useEffect` để sync preference sau hydration. Lý do: `readInitialLang` trả `'vi'` trên server nhưng `'en'` trên client → React throw HydrationError khi user dùng EN mode → `error.tsx` render trang "500". Fix: khởi tạo luôn là `'vi'` (khớp SSR), sync qua `useEffect` sau hydration — không bị flash vì inline script đã set `data-lang` trước khi React mount.

- [x] **`TiptapEditor.tsx` — Tiptap 3.x SSR error fix**: Thêm `immediatelyRender: false` vào `useEditor()`. Tiptap 3.x breaking change: bắt buộc set option này tường minh khi dùng trong môi trường SSR/Next.js, nếu không throw `"Tiptap Error: SSR has been detected, please set immediatelyRender explicitly to false"` → error boundary render trang "500". HTTP test tool trả 200 vì lỗi xảy ra hoàn toàn trong client-side JS sau khi server response đã gửi.

---

## Tóm tắt: Đã xong (không cần làm lại)

- `src/lib/image-upload.ts` → dual mode: Supabase Storage (production) / local filesystem (dev)
- `src/lib/supabase.ts` — Supabase admin client
- `src/app/layout.tsx` — `metadataBase` fix + Roboto font
- `.env.local` — Supabase credentials ready (commented out cho local, bỏ comment khi deploy)
- `.env` — local DB URL + `SEED_ADMIN_*` vars cho Prisma CLI
- `npm run build` — 0 errors, 0 warnings
- Local dev setup hoàn tất — server chạy tại http://localhost:3000
- UI & i18n improvements — fonts, navbar, bilingual hoàn chỉnh, original content toggle, author avatar fallback
- Backup `blog-trip-base.zip` (8.5 MB, 290 files) — 2026-05-12
- **QA Phase 1–7 hoàn tất** (2026-05-13): P1 ✅ P2 ✅ P3 ⚠️ P4 ✅ P5 ✅ P6 ✅ P7 ⚠️
- **Phase 9 — i18n Full Coverage + DB Cleanup** (2026-05-15): SubmitForm, CommentList, PostGrid, PostsFiltersClient, SeriesListClient, DestinationsClient — tất cả components chuyển ngôn ngữ đúng; test posts dọn dẹp
- **Bug fixes 2026-05-15**: `LanguageContext.tsx` hydration mismatch + `TiptapEditor.tsx` Tiptap 3.x `immediatelyRender: false` — trang `/submit` hoạt động đúng trong browser

---

## Công việc cần làm tiếp theo

**Ưu tiên 1 — Giải quyết DNS để apply migration (chọn 1 trong 3 cách)**

**Cách A (dễ nhất — thủ công trong dashboard):**
1. Vào [Supabase SQL Editor](https://supabase.com/dashboard/project/hnhhjfdfvyxijawooxqw/sql/new)
2. Copy toàn bộ nội dung file `prisma/migrations/20260508170939_init/migration.sql`
3. Paste vào SQL Editor → Run
4. Vào [Storage → Buckets](https://supabase.com/dashboard/project/hnhhjfdfvyxijawooxqw/storage/buckets) → tạo `post-images` (Public) + `submission-images` (Private)

**Cách B (đổi DNS Windows tạm thời — cần quyền admin):**
1. Network Settings → Adapter → DNS → đổi sang `8.8.8.8` (Google DNS)
2. Chạy `npx prisma migrate deploy` + `npx prisma db seed`
3. Đổi DNS lại sau khi xong

**Cách C (dùng pooler connection string từ dashboard):**
1. Vào [Database Settings](https://supabase.com/dashboard/project/hnhhjfdfvyxijawooxqw/settings/database)
2. Copy "Transaction mode" pooler connection string
3. Cập nhật `DATABASE_URL` trong `.env` + `.env.local`
4. Thử lại `npx prisma migrate deploy`

**Ưu tiên 2 — Deploy lên Vercel**

5. Push code lên GitHub
6. Vào https://vercel.com → New Project → Import repo
7. Set các env vars trong Vercel Dashboard (copy từ `.env.local` — xem bảng dưới)
8. Deploy → lấy URL được assign (vd: `https://blog-trip-xxx.vercel.app`)
9. Update `NEXTAUTH_URL` trong Vercel env vars = URL production
10. Redeploy

**Env vars cần set trên Vercel:**

| Key | Ghi chú |
|---|---|
| `DATABASE_URL` | Supabase connection string (Transaction pooler — port 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hnhhjfdfvyxijawooxqw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role/secret key |
| `NEXTAUTH_SECRET` | giữ nguyên giá trị hiện tại |
| `NEXTAUTH_URL` | URL production sau khi Vercel assign |
| `ADMIN_EMAIL` | `anthp.na@gmail.com` |
| `RESEND_API_KEY` | tùy chọn |

**Ưu tiên 3 — Verify production**

11. Chạy `tester-blog-trip` agent với `BASE_URL` = production URL (TC-P8-*)
12. Test upload ảnh → verify URL dạng `https://hnhhjfdfvyxijawooxqw.supabase.co/storage/...`
13. Test redeploy → ảnh cũ vẫn load (không mất như local filesystem)
14. Cập nhật phần Links → Production trong [technical.md](technical.md) với URL thực
