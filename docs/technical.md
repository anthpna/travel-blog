# technical.md — Kiến trúc kỹ thuật blog-trip

## Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript
- **Database:** PostgreSQL (local dev) / Supabase (production) + Prisma v5 ORM
- **Auth:** NextAuth.js v5 — JWT strategy, Credentials provider, single admin
- **Rich Text:** Tiptap (JSON lưu DB + HTML pre-render server-side cho SSG)
- **Image:** Sharp (resize → WebP) + Supabase Storage *(fallback local khi dev không có creds)*
- **Map:** React-Leaflet v4 + OpenStreetMap (dynamic import `ssr:false`)
- **Email:** Resend (notify admin — graceful skip nếu key rỗng)
- **Styling:** Tailwind CSS v3 + shadcn/ui + `@tailwindcss/typography`
- **Slug:** `slug` npm package (Unicode-aware, hỗ trợ tiếng Việt)

---

## Commands

```bash
# Dev server (chạy từ blog-trip/)
npm run dev          # → http://localhost:3000

# Build & lint
npm run build
npm run lint
npx tsc --noEmit     # type check

# Database
npx prisma migrate dev --name <tên>   # migration mới
npx prisma generate                    # regenerate client
npx prisma db seed                     # seed admin user
npx prisma studio                      # GUI → http://localhost:5555
```

---

## Links dự án

### Production *(Phase 8 — đang triển khai)*

| Dịch vụ | URL | Trạng thái |
|---|---|---|
| Blog (public) | *(chưa có — set sau khi deploy Vercel)* | ⏳ Chờ Vercel deploy |
| Supabase Project | https://supabase.com/dashboard/project/hnhhjfdfvyxijawooxqw | ✅ Đã tạo |
| Supabase Storage | https://supabase.com/dashboard/project/hnhhjfdfvyxijawooxqw/storage/buckets | ⏳ Chưa tạo buckets |
| Supabase DB | `db.hnhhjfdfvyxijawooxqw.supabase.co:5432` | ⏳ Migration chưa apply |
| Vercel Dashboard | https://vercel.com/dashboard | ⏳ Chưa connect repo |

### Local (dev)

| Trang | URL |
|---|---|
| Trang chủ blog | http://localhost:3000 |
| Danh sách bài viết | http://localhost:3000/posts |
| Điểm đến + Bản đồ | http://localhost:3000/destinations |
| Series hành trình | http://localhost:3000/series |
| Về tác giả | http://localhost:3000/about |
| Gửi bài | http://localhost:3000/submit |
| Admin Dashboard | http://localhost:3000/admin |
| Admin — Bài viết | http://localhost:3000/admin/posts |
| Admin — Bài gửi | http://localhost:3000/admin/submissions |
| Admin — Bình luận | http://localhost:3000/admin/comments |
| Admin — Điểm đến | http://localhost:3000/admin/destinations |
| Admin — Series | http://localhost:3000/admin/series |
| Login | http://localhost:3000/auth/login |
| Sitemap XML | http://localhost:3000/sitemap.xml |
| Robots.txt | http://localhost:3000/robots.txt |
| Prisma Studio | http://localhost:5555 |

### Dev credentials

- **Admin:** `admin@blog-trip.local` / `Admin@123456`
- **DB:** PostgreSQL 18 local — `localhost:5432`, DB `blog_trip`

---

## Environment Variables (`.env.local`)

```
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY
ADMIN_EMAIL
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
```

`.env` (chỉ Prisma CLI): chứa `DATABASE_URL` — cả hai gitignored.

---

## Đánh giá khả năng deploy (2026-05-12)

| Thành phần | Local | Production | Ghi chú |
|---|---|---|---|
| Source code | ✅ | ✅ | TypeScript 0 errors, ESLint 0 warnings, `npm run build` sạch |
| Auth | ✅ | ✅ | JWT callbacks OK, middleware OK, `session.user.id` OK |
| Image storage | ✅ | ⏳ | Local: `public/uploads/{bucket}/{year}/{month}/` · Production: Supabase buckets chưa tạo |
| Database | ✅ | ⏳ | Local: migration applied, admin seeded · Cloud: bị block IPv6-only |
| Supabase credentials | — | ✅ | Project `hnhhjfdfvyxijawooxqw` — bỏ comment trong `.env.local` khi deploy |
| OG image | ✅ | ✅ | `metadataBase` set từ `NEXTAUTH_URL` |
| Public pages | ✅ | ✅ | SSG/ISR, OG image, comments, map, about, 404/error |
| SEO | ✅ | ✅ | `sitemap.ts` + `robots.ts` hoàn chỉnh |
| Email (Resend) | ✅ | ✅ | Graceful skip nếu `RESEND_API_KEY` rỗng |
| Vercel | — | ⏳ | Chưa connect repo |

**Kết luận:** Local hoàn toàn sẵn sàng ✅. Production: cần giải quyết DNS issue để apply migration, tạo buckets, rồi deploy Vercel.

**DNS Issue (Phase 8 blocker hiện tại):**
- `db.hnhhjfdfvyxijawooxqw.supabase.co:5432` → chỉ có IPv6 (`2406:da1a:...`), máy dev không có IPv6
- `aws-0-ap-southeast-1.pooler.supabase.com` → có IPv4 (`52.77.146.31`) nhưng local DNS không resolve (cần Google DNS `8.8.8.8`)
- Workaround: đổi Windows DNS sang `8.8.8.8` hoặc tạo buckets/migrate thủ công qua Supabase Dashboard

---

## Kiến trúc

### Rendering Strategy

| Route | Strategy | revalidate |
|---|---|---|
| `/posts/[slug]` | SSG + ISR | 3600s |
| `/`, `/posts` | ISR | 60s |
| `/destinations`, `/destinations/[slug]`, `/series`, `/series/[slug]`, `/tags/[tag]` | ISR | 300s |
| `/about` | Static (SSG — DB fetch at build time) | — |
| `/submit`, `/auth/login` | Static shell | — |
| `/admin/*` | CSR (client-only) | — |

### Dual Content Storage

Mỗi bài viết lưu **2 dạng song song**:
- `contentVi` (Tiptap JSON) → load vào editor khi edit
- `contentHtmlVi` (HTML pre-rendered) → render trang public, không cần editor bundle

### Song ngữ (không dùng next-intl)

- Vi fields (`titleVi`, `contentHtmlVi`, `excerptVi`) — **bắt buộc**
- En fields — optional, null nếu không có
- `LanguageToggle` chỉ render khi `contentHtmlEn` tồn tại
- UI strings: `src/i18n/vi.ts` + `en.ts` inject qua React Context từ root `layout.tsx`
- Preference lưu `localStorage` (no hydration flash — inline `<script>` đọc trước React mount)

### Bảo vệ routes

- `src/middleware.ts` → bảo vệ `/admin/*` + `/api/submissions/:id/approve`
- `/admin/layout.tsx` → kiểm tra session lần 2 (defense-in-depth)
- Mỗi admin API route handler → gọi `auth()` + check session riêng

---

## Cấu trúc thư mục

```
src/
├── middleware.ts                       # Auth guard (/admin/* + approve API)
├── i18n/vi.ts, en.ts                  # UI strings (inject qua LanguageContext)
├── contexts/LanguageContext.tsx
├── types/slug.d.ts                    # Manual type stub cho `slug` package
├── lib/
│   ├── prisma.ts                       # Singleton PrismaClient
│   ├── auth.ts                         # NextAuth config + JWT/session callbacks
│   ├── get-session.ts                  # cache(auth) — dedup session per request
│   ├── image-upload.ts                 # Sharp resize → WebP → Supabase Storage (local fallback khi thiếu creds)
│   ├── slugify.ts                      # Unicode slug (tiếng Việt)
│   ├── reading-time.ts                 # strip HTML → word count → minutes
│   ├── resend.ts                       # notifyAdminComment + notifyAdminSubmission
│   ├── tag-colors.ts                   # tag slug → Tailwind color class map (static strings!)
│   └── utils.ts
├── components/
│   ├── layout/Navbar.tsx, Footer.tsx
│   ├── map/DestinationMap.tsx          # React-Leaflet (SSR: false)
│   ├── blog/
│   │   ├── PostCard.tsx, PostGrid.tsx  # size + variant props
│   │   ├── PostBody.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── ShareButtons.tsx            # Facebook, Zalo, Copy link
│   │   └── SeriesNav.tsx               # Prev/Next trong series
│   ├── comments/CommentForm.tsx, CommentList.tsx
│   ├── editor/TiptapEditor.tsx         # viOnly prop cho /submit
│   ├── admin/PostForm.tsx
│   └── ui/                             # shadcn/ui components
└── app/
    ├── layout.tsx                      # Root layout + LanguageContext + no-flash script
    ├── page.tsx                        # Homepage (ISR 60s) — nằm ngoài (public)/
    ├── not-found.tsx                   # 404 page toàn cục (fallback)
    ├── error.tsx                       # Error boundary toàn cục (client)
    ├── sitemap.ts                      # XML sitemap động
    ├── robots.ts                       # robots.txt (disallow /admin/ /api/)
    ├── (public)/
    │   ├── layout.tsx                  # Navbar + Footer
    │   ├── not-found.tsx               # 404 trong public layout (có Navbar/Footer)
    │   ├── about/page.tsx, AboutContent.tsx, loading.tsx
    │   ├── posts/page.tsx, [slug]/page.tsx, loading.tsx
    │   ├── posts/[slug]/opengraph-image.tsx  # runtime = 'nodejs' (Prisma)
    │   ├── destinations/page.tsx, [slug]/page.tsx, loading.tsx
    │   ├── series/page.tsx, [slug]/page.tsx, loading.tsx
    │   ├── tags/[tag]/page.tsx
    │   └── submit/page.tsx, SubmitForm.tsx
    ├── admin/
    │   ├── layout.tsx                  # Defense-in-depth session check
    │   ├── page.tsx                    # Dashboard với counts
    │   ├── posts/new/, [id]/edit/
    │   ├── destinations/, series/, comments/
    │   └── submissions/page.tsx, [id]/page.tsx
    └── api/
        ├── posts/route.ts, [id]/route.ts
        ├── comments/route.ts, [id]/route.ts
        ├── submissions/route.ts, [id]/route.ts, [id]/approve/route.ts
        ├── destinations/route.ts, [id]/route.ts
        ├── series/route.ts, [id]/route.ts
        ├── upload/route.ts
        └── subscribe/route.ts
```

---

## API Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/posts` | public | List PUBLISHED posts |
| POST | `/api/posts` | admin | Tạo post mới |
| GET/PUT/DELETE | `/api/posts/[id]` | admin | CRUD |
| POST | `/api/comments` | public | Gửi comment: fields `postId`, `name`, `content`, `email?` (→ PENDING) |
| GET | `/api/comments` | admin | List tất cả comments |
| PUT/DELETE | `/api/comments/[id]` | admin | Moderate |
| GET | `/api/submissions` | admin | List submissions |
| POST | `/api/submissions` | public | Gửi bài (→ PENDING + email notify) |
| GET/PUT | `/api/submissions/[id]` | admin | Detail / Reject |
| POST | `/api/submissions/[id]/approve` | admin | Atomic: tạo Post + APPROVED + revalidatePath |
| POST | `/api/upload` | public | Upload ảnh → Sharp → WebP (5MB limit) |
| CRUD | `/api/destinations/[id]` | admin | |
| CRUD | `/api/series/[id]` | admin | |
| POST | `/api/subscribe` | public | Newsletter |

---

## Database Models

| Model | Mô tả |
|---|---|
| `User` | Admin duy nhất (email + bcrypt password) |
| `Post` | Bài viết — Vi/En content, destination, series, readingTime, featured, status |
| `Destination` | Điểm đến với tọa độ lat/lng cho Leaflet map |
| `Series` | Nhóm bài thành hành trình nhiều phần |
| `Tag` | Tags song ngữ (many-to-many với Post) |
| `Comment` | Ẩn danh, PENDING → APPROVED/SPAM |
| `Submission` | Bài gửi từ user, PENDING → APPROVED (→ tạo Post) / REJECTED |
| `Subscriber` | Newsletter subscribers |

Migration: `20260508170939_init` — tất cả 8 models đã apply.

---

## Lưu ý kỹ thuật quan trọng

### Dependencies & versions

- **Prisma@5** — không dùng v7 (thay đổi cú pháp `datasource`)
- **react-leaflet@4** — không dùng v5 (yêu cầu React 19; dự án dùng React 18)
- **`@tiptap/html`** — cần install riêng để dùng `generateHTML()` server-side
- **`slug` package** — không có `@types/slug`; dùng `src/types/slug.d.ts` thủ công

### Config gotchas

- **`.env` vs `.env.local`** — `.env` chứa `DATABASE_URL` + `SEED_ADMIN_*` cho Prisma CLI; `.env.local` chứa secrets cho Next.js runtime. Prisma CLI **không** đọc `.env.local`
- **Seed script** — dùng `node -r ts-node/register` thay `ts-node` trực tiếp (Windows PATH issue). `SEED_ADMIN_EMAIL/PASSWORD` phải có trong `.env` (không phải `.env.local`)
- **Switch local ↔ production** — chỉ cần comment/bỏ comment 3 Supabase vars trong `.env.local` và đổi `DATABASE_URL` trong `.env`
- **shadcn@latest (v4) + Tailwind v3** — `init` inject CSS v4 (`oklch`, `@import "tw-animate-css"`). Phải rewrite `globals.css` về HSL + update `tailwind.config.ts` thủ công
- **NextAuth v5 `session.user.id`** — **bắt buộc** thêm `callbacks.jwt` + `callbacks.session` trong `auth.ts`. Thiếu thì `session.user.id = undefined`
- **NEXTAUTH_URL** — dùng cho sitemap domain + ShareButtons URL + auth redirect. Trong dev: `http://localhost:3000`. Khi deploy: đổi thành domain thực

### Rendering & data patterns

- **RSC Date serialization** — `Date` props từ RSC → Client Component thành string. Wrap: `new Date(post.publishedAt).toISOString()`, không gọi `.toISOString()` trực tiếp
- **RSC serialization** — chỉ pass đúng fields cần thiết sang Client Component (tránh serialize `contentVi` JSON vài chục KB qua RSC boundary)
- **`React.cache()` dedup** — `src/lib/get-session.ts` export `cache(auth)` — cùng request chỉ query session 1 lần
- **OG image** — dùng `runtime = 'nodejs'` (không `'edge'`) vì cần Prisma; **không set `images:[]`** trong `generateMetadata` khi không có coverImage — để trống thì Next.js tự dùng `opengraph-image.tsx`
- **`notFound()` trong `generateMetadata`** — bắt buộc gọi `notFound()` thay vì `return {}` khi resource không tìm thấy, để HTTP 404 propagate đúng (đặc biệt quan trọng khi route cha có `loading.tsx`)

### UI & component patterns

- **Language flash** — inject `<script>` đồng bộ đầu `<body>` đọc `localStorage` → set `data-lang` → `LanguageProvider` lazy `useState` đọc attribute. `<html>` cần `suppressHydrationWarning`
- **Tailwind class purging** — `tag-colors.ts` phải viết full class string (không dynamic `bg-${color}-100`) — JIT cần static string
- **`-base.*` backup files** — mỗi file bị refactor có bản `*-base.*` cùng thư mục (e.g., `PostCard-base.tsx`, `page-base.tsx`). TypeScript compile chúng — **không import**, **không xóa** mà không hỏi trước
- **`en-base.ts` phải sync với `en.ts`** — `en-base.ts` cũng implement `Translations` interface. Mỗi khi thêm field vào interface trong `vi.ts` hoặc `en.ts`, phải cập nhật `en-base.ts` tương ứng (không thì TypeScript error)
- **TiptapEditor `viOnly` prop** — dùng cho `/submit` để ẩn tab EN
- **Tiptap 3.x `immediatelyRender: false`** — bắt buộc set trong `useEditor()` khi dùng Next.js/SSR. Thiếu → throw `"SSR has been detected"` error → error boundary render. Đã fix trong `EditorPane` (TiptapEditor.tsx)
- **`LanguageProvider` — useState pattern** — phải dùng `useState('vi')` + `useEffect` để sync preference, **không** dùng `useState(readInitialLang)`. Lý do: `readInitialLang` trả `'vi'` trên server nhưng `'en'` trên client → hydration mismatch → error boundary render trên trang có nhiều i18n strings (đặc biệt `/submit`)
- **Submission `contentVi as any`** — Prisma `JsonValue` (output) không tự assign `InputJsonValue` (input). Cast `as any` — an toàn vì schema đảm bảo non-null
- **Comment API field** — `POST /api/comments` nhận field `name` (không phải `authorName`)
- **Roboto Vietnamese** — `next/font/google` Roboto yêu cầu `subsets: ['latin', 'vietnamese']` để load đủ ký tự có dấu. Thiếu `'vietnamese'` thì chữ tiếng Việt fallback về sans-serif mặc định
- **`PostMetaClient` — RSC workaround** — `page.tsx` là RSC, không dùng được `useLang()`. Mọi string/data phụ thuộc ngôn ngữ UI (date locale, tag name, dest name) phải qua Client Component wrapper. `PostMetaClient.tsx` nhận serializable props từ RSC
- **`detectOriginalLang`** — chạy server-side trong RSC `page.tsx`, không cần browser API. Heuristic: ≥8% non-whitespace chars là diacritic tiếng Việt → bài gốc là `'vi'`; ngược lại `'en'`. Dùng để quyết định button "Hiển thị nội dung gốc" có hiện không
- **`public/site/` folder** — `icons/` cho favicon/logo/SVG; `images/` cho ảnh static website (author.jpg, OG default, v.v.). Phân biệt với `public/uploads/` là ảnh bài viết do user upload
- **RSC listing pages → Client wrapper pattern** — `/posts`, `/series`, `/destinations` là RSC (data fetch) nhưng pass toàn bộ data có **cả nameVi lẫn nameEn** sang `PostsFiltersClient` / `SeriesListClient` / `DestinationsClient`. Client chọn ngôn ngữ qua `lang`. Không hardcode Vi strings trong RSC page files.
- **`PostGrid` là Client Component** — convert để dùng `useLang()` cho `t.post.noPostsFound`. Khi không truyền `emptyMessage` prop thì tự dùng translation key.
- **`SubmitForm` chứa cả page header** — h1 + description của `/submit` nằm trong `SubmitForm.tsx` (Client Component), không phải `page.tsx` (RSC), vì cần `useLang()` để dịch.

### Known dev-mode behavior

- **404 HTTP status trong route group** — `notFound()` bên trong Suspense boundary (do `loading.tsx` ở thư mục cha) không propagate HTTP 404 status trong dev mode. Trong production build hoạt động đúng. Workaround: gọi `notFound()` trong `generateMetadata` (chạy trước Suspense) + `(public)/not-found.tsx`
- **Port conflict** — `npm run dev` tự chọn port 3001, 3002... nếu 3000 bị chiếm. `NEXTAUTH_URL` vẫn trỏ 3000 → admin redirect sau login về sai port. Chỉ xảy ra trong dev khi có app khác chiếm port 3000
