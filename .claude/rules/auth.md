# Auth & Route Protection

## Middleware

`src/middleware.ts` là lớp bảo vệ đầu tiên. Phải match:
- `/admin/:path*` — tất cả admin pages
- `/api/posts` (POST, PUT, DELETE)
- `/api/comments/:id` (PUT, DELETE)
- `/api/submissions/:id/approve` (POST)
- `/api/upload` khi caller là admin

Khi thêm API route mới cần auth, cập nhật `matcher` trong middleware.

## Defense-in-depth

`/admin/layout.tsx` kiểm tra session lần thứ hai bằng `auth()` từ NextAuth. Nếu không có session, redirect về `/auth/login`. Không bỏ bước này dù middleware đã chặn.

## API route authorization

Trong mỗi admin API route handler, gọi `auth()` và check session trước khi xử lý:

```typescript
const session = await auth()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

## Supabase Service Role Key

`SUPABASE_SERVICE_ROLE_KEY` chỉ được dùng trong:
- `src/lib/image-upload.ts` (server-side)
- `src/app/api/upload/route.ts` (server-side)

**Không bao giờ** import hoặc expose key này ở Client Component hay file có `"use client"`.

## Single admin

Hệ thống chỉ có một admin (Phan Thanh An). Không cần implement multi-user role management phức tạp — `Role` enum có `ADMIN` và `EDITOR` nhưng UI chỉ cần check `session` tồn tại hay không.
