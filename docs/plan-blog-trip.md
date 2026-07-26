# Blog-Trip: Travel Blog — Implementation Plan (Optimized)

## Context

Build a full-stack travel blog từ đầu tại `D:\WORK\JOB\AI\blog-trip`.  
Founder: **Phan Thanh An** (sinh 1993). Blog chia sẻ trải nghiệm chuyến đi.

**Cải tiến so với plan ban đầu** (dựa trên research các travel blog chuyên nghiệp):
- Song ngữ Việt/Anh (bài viết có cả 2 phiên bản liên kết nhau)
- Bản đồ điểm đến tương tác (Leaflet.js, không cần API key)
- Travel Series (nhóm bài viết thành hành trình nhiều phần)
- Reading time tự động, Featured posts, OG image động
- Destination taxonomy riêng (thay vì chỉ dùng Tags)
- Chia sẻ bao gồm Zalo (người dùng Việt Nam)

---

## So sánh với các Travel Blog phổ biến

| Tính năng | Plan gốc | Plan tối ưu | Nomadic Matt | Salt in Our Hair |
|---|---|---|---|---|
| Interactive map | ✗ | ✅ Leaflet.js | ✗ | ✗ |
| Travel Series | ✗ | ✅ | ✗ | ✅ |
| Song ngữ | ✗ | ✅ Vi+En | ✗ | ✅ En |
| Destination pages | Tags only | ✅ /destinations/[slug] | ✅ | ✅ |
| Reading time | ✗ | ✅ auto | ✅ | ✅ |
| Featured posts | ✗ | ✅ | ✅ | ✅ |
| OG image động | ✗ | ✅ Next.js ImageResponse | - | - |
| Zalo share | ✗ | ✅ | ✗ | ✗ |
| Comment | ✅ | ✅ ẩn danh | ✅ | ✗ |
| User submission | ✅ | ✅ | ✗ | ✗ |
| Admin panel | ✅ | ✅ | ✗ | ✗ |

---

## Tech Stack

| Concern | Choice | Ghi chú |
|---|---|---|
| Framework | **Next.js 14 App Router + TypeScript** | SSG/ISR cho SEO, API routes, Vercel-native |
| Database | **PostgreSQL (Supabase) + Prisma ORM** | Free tier, type-safe, co-located image storage |
| Auth | **NextAuth.js v5 (Credentials)** | Single-admin JWT, không cần infra thêm |
| Rich Text | **Tiptap** | Open source, headless, custom image-upload node |
| Image Storage | **Supabase Storage + Sharp** | Resize + WebP, cùng project với DB |
| Map | **Leaflet.js + React-Leaflet** | Open source, không cần API key, OpenStreetMap |
| Email | **Resend** | Thông báo admin (3k email/tháng free) |
| OG Image | **Next.js ImageResponse** (built-in) | Dynamic OG image không cần service ngoài |
| Styling | **Tailwind CSS + shadcn/ui** | Utility-first + accessible admin components |
| Slug | **`slug` npm package** | Unicode-aware (xử lý tiếng Việt) |

---

## Database Schema

```prisma
// prisma/schema.prisma

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now())
  posts        Post[]
}

enum Role { ADMIN EDITOR }

// Quốc gia / vùng miền — dùng cho map và navigation
model Destination {
  id          String  @id @default(cuid())
  nameVi      String
  nameEn      String
  slug        String  @unique
  country     String                    // "vietnam", "thailand"
  countryCode String                    // ISO "VN", "TH"
  lat         Float                     // Tọa độ cho map pin
  lng         Float
  coverImage  String?
  posts       Post[]
}

// Nhóm bài viết thành hành trình nhiều phần
model Series {
  id          String   @id @default(cuid())
  titleVi     String
  titleEn     String?
  slug        String   @unique
  description String?
  coverImage  String?
  createdAt   DateTime @default(now())
  posts       Post[]
}

model Post {
  id            String       @id @default(cuid())
  titleVi       String
  titleEn       String?
  slug          String       @unique
  excerptVi     String
  excerptEn     String?
  contentVi     Json                    // Tiptap JSON (tiếng Việt)
  contentHtmlVi String                  // Pre-rendered HTML — dùng cho SSG
  contentEn     Json?
  contentHtmlEn String?
  coverImage    String?
  status        PostStatus   @default(DRAFT)
  featured      Boolean      @default(false)
  readingTime   Int          @default(0)  // Phút đọc (tự tính)
  views         Int          @default(0)
  author        User         @relation(fields: [authorId], references: [id])
  authorId      String
  destination   Destination? @relation(fields: [destinationId], references: [id])
  destinationId String?
  series        Series?      @relation(fields: [seriesId], references: [id])
  seriesId      String?
  seriesOrder   Int?
  tags          Tag[]        @relation("PostTags")
  comments      Comment[]
  publishedAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([slug])
  @@index([status, publishedAt])
  @@index([destinationId])
  @@index([seriesId])
}

enum PostStatus { DRAFT PUBLISHED ARCHIVED }

model Tag {
  id     String  @id @default(cuid())
  nameVi String
  nameEn String?
  slug   String  @unique
  posts  Post[]  @relation("PostTags")
}

model Comment {
  id        String        @id @default(cuid())
  post      Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  name      String
  email     String
  content   String
  status    CommentStatus @default(PENDING)
  createdAt DateTime      @default(now())

  @@index([postId, status])
}

enum CommentStatus { PENDING APPROVED SPAM }

model Submission {
  id            String           @id @default(cuid())
  titleVi       String
  titleEn       String?
  contentVi     Json
  contentHtmlVi String
  excerptVi     String?
  coverImage    String?
  authorName    String
  authorEmail   String
  status        SubmissionStatus @default(PENDING)
  adminNotes    String?
  createdAt     DateTime         @default(now())
  reviewedAt    DateTime?
  postId        String?          @unique
}

enum SubmissionStatus { PENDING APPROVED REJECTED }

model Subscriber {
  id          String    @id @default(cuid())
  email       String    @unique
  confirmedAt DateTime?
  createdAt   DateTime  @default(now())
}
```

**Lý do lưu dual content (JSON + HTML):**
- `contentVi` JSON → load vào Tiptap editor để re-edit
- `contentHtmlVi` HTML → render trực tiếp trên trang public (không cần load editor bundle → tăng performance)

---

## Project Structure

```
blog-trip/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                          # Tạo admin user ban đầu
├── public/
│   ├── og-default.jpg                   # Default OG image
│   └── about-founder.jpg                # Ảnh Phan Thanh An
├── src/
│   ├── middleware.ts                    # Bảo vệ /admin/* và write APIs
│   ├── i18n/
│   │   ├── vi.ts                        # Chuỗi UI tiếng Việt
│   │   └── en.ts                        # Chuỗi UI tiếng Anh
│   ├── lib/
│   │   ├── prisma.ts                    # Singleton Prisma client
│   │   ├── auth.ts                      # NextAuth config
│   │   ├── supabase.ts                  # Supabase Storage client
│   │   ├── image-upload.ts              # Sharp resize + upload pipeline
│   │   ├── slugify.ts                   # title → URL-safe slug (hỗ trợ Unicode)
│   │   ├── reading-time.ts              # Tính phút đọc từ word count
│   │   └── resend.ts                    # Email notification client
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx               # Có language toggle Vi/En
│   │   │   ├── Footer.tsx               # Newsletter subscribe widget
│   │   │   └── AdminSidebar.tsx
│   │   ├── map/
│   │   │   ├── DestinationMap.tsx       # React-Leaflet (dynamic import, SSR: false)
│   │   │   └── MapPin.tsx
│   │   ├── blog/
│   │   │   ├── PostCard.tsx             # Hiển thị readingTime, destination badge
│   │   │   ├── PostGrid.tsx
│   │   │   ├── PostBody.tsx             # Render contentHtmlVi / contentHtmlEn
│   │   │   ├── LanguageToggle.tsx       # Switch Vi ↔ En
│   │   │   ├── ShareButtons.tsx         # Facebook, Zalo, Copy link
│   │   │   ├── SeriesNav.tsx            # Prev/Next trong series
│   │   │   └── FeaturedPosts.tsx        # Hero section trang chủ
│   │   ├── comments/
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentList.tsx
│   │   ├── editor/
│   │   │   ├── TiptapEditor.tsx         # Dùng cả ở admin và /submit
│   │   │   └── EditorToolbar.tsx
│   │   └── ui/                          # shadcn/ui components
│   └── app/
│       ├── layout.tsx                   # Root layout + LanguageContext
│       ├── page.tsx                     # Home
│       ├── about/page.tsx
│       ├── posts/
│       │   ├── page.tsx
│       │   └── [slug]/
│       │       ├── page.tsx
│       │       └── opengraph-image.tsx  # Dynamic OG image (Edge Function)
│       ├── destinations/
│       │   ├── page.tsx
│       │   └── [slug]/page.tsx
│       ├── series/
│       │   ├── page.tsx
│       │   └── [slug]/page.tsx
│       ├── tags/[tag]/page.tsx
│       ├── submit/page.tsx
│       ├── auth/login/page.tsx
│       ├── admin/
│       │   ├── layout.tsx
│       │   ├── page.tsx                 # Dashboard
│       │   ├── posts/new + [id]/edit
│       │   ├── destinations/page.tsx
│       │   ├── series/page.tsx
│       │   ├── submissions/[id]/page.tsx
│       │   └── comments/page.tsx
│       ├── api/
│       │   ├── posts/, comments/, submissions/, upload/, tags/
│       │   ├── destinations/route.ts
│       │   ├── series/route.ts
│       │   └── subscribe/route.ts
│       └── sitemap.ts
```

---

## Tất cả Routes

### Public
| Route | Mô tả | Rendering |
|---|---|---|
| `/` | Home: Featured + Recent posts | ISR 60s |
| `/about` | Founder Phan Thanh An + mini map | Static |
| `/posts` | Danh sách bài, filter by tag/destination | ISR 60s |
| `/posts/[slug]` | Bài viết, language toggle Vi/En | SSG + ISR |
| `/destinations` | Leaflet map + grid tất cả điểm đến | ISR 300s |
| `/destinations/[slug]` | Bài viết thuộc 1 địa điểm | ISR 300s |
| `/series` | Danh sách travel series | ISR 300s |
| `/series/[slug]` | Bài trong series + prev/next | ISR 300s |
| `/tags/[tag]` | Bài theo tag | ISR 300s |
| `/submit` | Form gửi bài của người dùng | Static shell |
| `/auth/login` | Đăng nhập admin | Static |

### Admin (bảo vệ bằng NextAuth session)
| Route | Mô tả |
|---|---|
| `/admin` | Dashboard: stats + pending counts |
| `/admin/posts` | CRUD posts, toggle featured |
| `/admin/posts/new` + `/admin/posts/[id]/edit` | Tiptap editor (Vi + En tabs) |
| `/admin/destinations` | CRUD destinations + lat/lng |
| `/admin/series` | CRUD travel series |
| `/admin/submissions` + `/[id]` | Approve/reject bài gửi |
| `/admin/comments` | Moderation table |

### API Endpoints
| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET/POST | `/api/posts` | public/admin | List published / Create |
| GET/PUT/DELETE | `/api/posts/[id]` | admin | CRUD |
| POST | `/api/comments` | public | Submit (PENDING) |
| PUT/DELETE | `/api/comments/[id]` | admin | Moderate |
| GET/POST | `/api/submissions` | admin/public | List / Submit |
| POST | `/api/submissions/[id]/approve` | admin | Approve → create Post |
| POST | `/api/upload` | admin+public | Upload ảnh → Supabase |
| GET | `/api/destinations` | public | List destinations |
| GET | `/api/series` | public | List series |
| POST | `/api/subscribe` | public | Newsletter subscribe |

---

## Chi tiết triển khai các tính năng quan trọng

### 1. Bản đồ điểm đến (Leaflet.js)

- `react-leaflet` + OpenStreetMap tiles (không cần API key)
- **Bắt buộc dynamic import** với `ssr: false` để tránh lỗi server-side
- Mỗi Destination có `lat`, `lng` trong DB
- Click pin → popup: ảnh bìa, tên, số bài, link `/destinations/[slug]`
- Xuất hiện ở: `/destinations` (full page) và `/about` (mini, 250px)

### 2. Travel Series

- `SeriesNav` component hiện dưới mỗi bài thuộc series:
  ```
  ┌─────────────────────────────────────────────────┐
  │ Hành trình Tây Bắc 10 ngày (4 phần)            │
  │ ← Part 2: Mộc Châu    Part 4: Sapa →            │
  └─────────────────────────────────────────────────┘
  ```
- `/series/[slug]`: Timeline dọc, thứ tự phần, trạng thái published/coming soon

### 3. Song ngữ Việt + Anh

- Không dùng `next-intl` (phức tạp không cần thiết cho personal blog)
- Post có fields `titleVi/contentHtmlVi` + `titleEn/contentHtmlEn` (optional)
- `LanguageToggle` chỉ hiện khi bài có bản tiếng Anh
- Lưu ngôn ngữ vào `localStorage`
- UI strings: `src/i18n/vi.ts` + `en.ts` inject qua React Context

### 4. Dynamic OG Image

- File `src/app/posts/[slug]/opengraph-image.tsx`
- Next.js tự tạo Edge Function: background = coverImage, overlay = tiêu đề + logo
- Fallback `public/og-default.jpg` nếu không có cover

### 5. Image Upload Pipeline

1. Tiptap toolbar → file input → POST `/api/upload`
2. Sharp: resize max 1920px → WebP 82% quality
3. Upload Supabase Storage `post-images/{year}/{month}/{uuid}.webp`
4. Trả về URL → Tiptap insert `<img>` node
5. Public submitters upload vào bucket `submission-images/` (limit 5MB)

### 6. Email (Resend)

- Notify admin khi có submission mới
- Notify admin khi có comment cần duyệt
- Free tier: 3000 email/tháng

### 7. Share Buttons

- **Facebook** (Share Dialog API)
- **Zalo** (`https://zalo.me/share/...`)
- **Copy link** (Clipboard API + toast)

---

## Implementation Phases

### Phase 1 — Foundation
1. `npx create-next-app@latest blog-trip --typescript --tailwind --app --src-dir`
2. Install dependencies (xem CLAUDE.md)
3. `prisma/schema.prisma` → `npx prisma migrate dev --name init`
4. `src/lib/prisma.ts`, `auth.ts`, `middleware.ts`
5. Login page + `prisma/seed.ts` → `npx prisma db seed`
6. **Verify:** `/admin` → redirect → login → vào dashboard

### Phase 2 — Admin CRUD + Editor
1. `npx shadcn@latest init` + add components
2. `TiptapEditor` với tabs Vi/En
3. Image upload: `image-upload.ts` + `/api/upload`
4. Post API + slug + reading-time tự tính
5. Admin: posts CRUD, destinations CRUD, series CRUD
6. **Verify:** Tạo destination → series → post → publish

### Phase 3 — Public Blog
1. Root layout + LanguageContext + i18n
2. Homepage (ISR), posts listing, post detail (SSG)
3. `opengraph-image.tsx`, `ShareButtons`, `LanguageToggle`, `SeriesNav`
4. **Verify:** OG image đúng, series nav hoạt động, language toggle

### Phase 4 — Destination Map
1. `DestinationMap.tsx` với dynamic import SSR: false
2. `/destinations` full map + `/destinations/[slug]` listing
3. Mini map trên `/about`
4. **Verify:** Map load, click pin, popup đúng

### Phase 5 — Comments
1. Comment API + `CommentForm` + `CommentList`
2. `/admin/comments` moderation + Resend notify
3. **Verify:** Submit → PENDING → approve → public

### Phase 6 — User Submissions
1. Submission API + `/submit` page
2. Admin review + approve → create Post + `revalidatePath`
3. Resend notify admin
4. **Verify:** Submit → email → approve → post live

### Phase 7 — About + SEO Polish
1. `/about`: Phan Thanh An (1993), bio, mini map, travel stats
2. `app/sitemap.ts`: posts + destinations + series
3. `robots.txt`, `not-found.tsx`, `error.tsx`, loading skeletons
4. Newsletter subscribe (footer)

### Phase 8 — Deployment
1. Supabase: migrate + seed
2. Vercel: env vars + deploy
3. Storage bucket policies
4. Full flow test

---

## Environment Variables (`.env.local`)

```bash
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=
ADMIN_EMAIL=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

---

## Verification Checklist

- [ ] Admin login + session gate `/admin/*`
- [ ] Tạo post (ảnh + destination + series) → publish → SSG đúng
- [ ] Language toggle Vi/En hoạt động
- [ ] Leaflet map load, click pin hiện popup
- [ ] SeriesNav hiện prev/next đúng
- [ ] OG image động từ cover + title
- [ ] Share Zalo + Facebook hoạt động
- [ ] Comment → PENDING → approve → public + Resend notify
- [ ] Submission → approve → post live + ISR revalidate + Resend notify
- [ ] About: Phan Thanh An, 1993, mini map
- [ ] Sitemap: posts + destinations + series
- [ ] Mobile responsive
- [ ] Vercel deploy với Supabase
