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

## OG Image

`opengraph-image.tsx` dùng `coverImage` URL làm background. Nếu `coverImage` null → fallback `public/og-default.jpg`.
