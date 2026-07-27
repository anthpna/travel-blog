# Image Upload Pipeline

## Flow

```
Client (Tiptap toolbar / submit form)
  → POST /api/upload (multipart/form-data)
  → Sharp: resize max 1920px width, WebP 82% quality
  → Supabase Storage upload
  → Return { url }
  → Tiptap insert <img> node / form preview
```

## Bucket & path conventions

| Caller | Bucket | Path pattern |
|---|---|---|
| Admin (post editor) | `post-images` | `{year}/{month}/{uuid}.webp` |
| Public (submission) | `submission-images` | `{uuid}.webp` |

Bucket `post-images` phải có policy **public read**. `submission-images` chỉ server-side read.

## Giới hạn

- Admin upload: không giới hạn cứng (nhưng Sharp resize đảm bảo output ≤ ~500KB).
- Public submission upload: giới hạn **5MB** file gốc (check trước khi xử lý).

## Sharp settings

```typescript
await sharp(buffer)
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toBuffer()
```

## Cover image vs inline image

- `coverImage` trong Post/Destination/Series: lưu URL string, upload qua cùng pipeline.
- Inline images trong Tiptap content: URL embed trực tiếp vào Tiptap JSON node.

## Form admin: dùng `ImageUploadField`, không tự viết input upload

Mọi form admin có ảnh bìa (Post / Destination / Series) dùng chung `src/components/admin/ImageUploadField.tsx`:

```tsx
<ImageUploadField label="Ảnh bìa" value={form.coverImage || null}
  onChange={(v) => set('coverImage', v ?? '')} />
```

Component lo sẵn: nút tải ảnh lên (`/api/upload`), preview, nút xóa, ô dán URL thủ công (tương thích ngược), và cảnh báo khi host ảnh nằm ngoài allowlist. Không copy-paste lại logic `FormData` + `fetch('/api/upload')` ở form mới.

## `storage://` và signed URL

Ảnh upload vào bucket **private** (`submission-images`) trả về ref `storage://<bucket>/<path>` — **không render trực tiếp được**. Quy tắc:

- Giá trị lưu DB: giữ nguyên ref `storage://...`.
- Giá trị hiển thị: gọi `getDisplayUrl(ref)` từ `src/lib/image-upload.ts` (server-side) để sinh signed URL có hạn (`SIGNED_URL_TTL_SECONDS` trong `src/config/storage.ts`).
- `/api/upload` trả về **2 trường**: `url` (lưu DB) và `previewUrl` (hiển thị ngay trên client).
- `/api/submissions/[id]` GET trả thêm `coverImageUrl` (đã ký) bên cạnh `coverImage`.

`getDisplayUrl` trả `null` khi không ký được (Supabase lỗi/không với tới) — component gọi phải chịu được `null`, `SafeImage` sẽ hiện fallback. Không để lỗi này làm vỡ trang.

## Render ảnh: luôn dùng `SafeImage`, không dùng `next/image` trực tiếp

`coverImage` của Post/Destination/Series có thể là URL **do admin nhập tay** (form admin có ô "URL ảnh bìa" tự do). Nếu host không nằm trong `images.remotePatterns`, Vercel trả `400 BAD_REQUEST / INVALID_IMAGE_OPTIMIZE_REQUEST` và ảnh vỡ.

Vì vậy mọi chỗ render ảnh từ DB phải dùng `src/components/ui/SafeImage.tsx`:

```tsx
import SafeImage from '@/components/ui/SafeImage'

<SafeImage src={dest.coverImage} alt={dest.nameVi} fill sizes="..." className="object-cover" />
```

SafeImage tự xử lý:
- Host **trong** allowlist → `next/image` bình thường (có optimize).
- Host **ngoài** allowlist / `storage://` / URL sai → `unoptimized` (tải thẳng), không bao giờ ra lỗi 400.
- Ảnh tải lỗi (404, dead link) → render `fallback` (mặc định khối gradient xám).
- `src` null/rỗng → render `fallback` (không cần bọc `{x ? <Image/> : <div/>}` nữa).

Allowlist host nằm ở **`src/config/image-hosts.mjs`** — file này là nguồn duy nhất, được `next.config.mjs` dùng để sinh `remotePatterns` và được SafeImage dùng lúc render. Thêm host mới chỉ cần thêm 1 dòng vào `REMOTE_IMAGE_PATTERNS`.

Chỉ dùng `next/image` trực tiếp cho **asset tĩnh trong `public/`** (vd avatar `/site/images/author.jpg`).

## OG Image

`opengraph-image.tsx` dùng `coverImage` URL làm background. Nếu `coverImage` null → fallback `public/og-default.jpg`.
