# Database & Prisma

## Prisma client

Dùng singleton từ `src/lib/prisma.ts` — không tạo `new PrismaClient()` trực tiếp ở nơi khác. Pattern singleton tránh connection pool exhaustion trong Next.js dev (hot reload tạo nhiều instance).

## Slug generation

Luôn dùng package `slug` (không tự viết):

```typescript
import slugify from 'slug'
const postSlug = slugify(titleVi, { locale: 'vi' })
```

Package này xử lý Unicode tiếng Việt đúng cách (ví dụ: "Hà Nội" → "ha-noi").

## Quan hệ Post

Post có thể có:
- `destination` (optional) — một điểm đến
- `series` (optional) + `seriesOrder` (Int?) — vị trí trong hành trình
- `tags` (many-to-many qua `PostTags`) — nhiều tag

Khi query post detail cho trang public, luôn include `destination`, `series`, `tags`, và `comments` (status APPROVED).

## Comment moderation flow

```
POST /api/comments → status: PENDING
PUT /api/comments/[id] → status: APPROVED | SPAM
```

Chỉ render comment có `status: 'APPROVED'` trên trang public.

## Submission → Post approval

Khi admin approve submission:
1. Tạo `Post` mới từ Submission fields (copy title, content, excerpt, coverImage).
2. Set `Submission.status = APPROVED`, `Submission.postId = newPost.id`, `Submission.reviewedAt = now`.
3. Gọi `revalidatePath` cho các routes bị ảnh hưởng.

Thực hiện trong một Prisma transaction để đảm bảo atomic.

## Indexes đã có trong schema

`Post` có index trên `[status, publishedAt]` và `[destinationId]` và `[seriesId]`. Khi viết query, ưu tiên filter theo các fields này trước để tận dụng index.
