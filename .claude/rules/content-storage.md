# Content Storage (Dual JSON + HTML)

## Pattern

Mỗi bài viết lưu content **2 dạng song song**:

| Field | Type | Dùng khi |
|---|---|---|
| `contentVi` | `Json` (Tiptap JSON) | Load vào editor để re-edit |
| `contentHtmlVi` | `String` (HTML) | Render trên trang public — không cần editor bundle |

Tương tự cho bản En: `contentEn` (Json?) và `contentHtmlEn` (String?).

## Quy trình save

Khi tạo hoặc cập nhật post, server phải:

1. Nhận Tiptap JSON từ client.
2. Generate HTML từ JSON bằng Tiptap server-side (dùng `generateHTML` từ `@tiptap/html`).
3. Tính `readingTime` từ word count của `contentHtmlVi`: strip HTML tags → đếm words → `Math.ceil(words / 200)`.
4. Lưu cả JSON, HTML, và readingTime vào DB trong một transaction.

**Không bao giờ** lưu JSON mà không lưu HTML cùng lúc — hai field phải luôn đồng bộ.

## Reading time

- Tính từ `contentHtmlVi` (bản tiếng Việt), không dùng bản En.
- Đơn vị: phút (số nguyên, tối thiểu 1).
- Logic nằm trong `src/lib/reading-time.ts`.

## Submission

`Submission` model cũng lưu `contentVi` (Json) + `contentHtmlVi` (String) theo cùng pattern. Khi admin approve, copy các fields này sang Post mới.
