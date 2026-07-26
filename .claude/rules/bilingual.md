# Bilingual (Song ngữ Vi/En)

## Nguyên tắc cốt lõi

Không dùng `next-intl` hay bất kỳ i18n framework nào. Approach đơn giản, đủ dùng cho personal blog.

## Content fields

- Vi fields (`titleVi`, `contentVi`, `contentHtmlVi`, `excerptVi`) là **bắt buộc**.
- En fields (`titleEn`, `contentEn`, `contentHtmlEn`, `excerptEn`) là **optional**.
- Khi tạo model mới có text content, luôn thêm cả cặp `nameVi`/`nameEn` — En có thể null.

## LanguageToggle

- Chỉ render `LanguageToggle` khi `contentHtmlEn` tồn tại (không null/empty).
- Preference ngôn ngữ lưu vào `localStorage` key `'lang'`, giá trị `'vi'` hoặc `'en'`.
- Default là `'vi'` nếu chưa có preference.

## UI strings

- Toàn bộ UI strings (navbar, buttons, labels) nằm trong `src/i18n/vi.ts` và `src/i18n/en.ts`.
- Inject vào toàn cây component qua React Context được setup trong `app/layout.tsx`.
- Không hardcode string tiếng Việt hay tiếng Anh trực tiếp trong JSX — luôn lấy từ context.

## Admin editor

- Tiptap editor trong admin có **2 tabs**: Vi (bắt buộc điền) và En (có thể bỏ qua).
- Khi submit form tạo/sửa post, nếu tab En rỗng thì không lưu En fields (giữ null trong DB).
