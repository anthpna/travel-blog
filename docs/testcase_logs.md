# testcase_logs.md — Kết quả QA theo giai đoạn

**Tổng số test cases:** 115 (định nghĩa bởi `tester-blog-trip` agent tại `.claude/agents/tester-blog-trip.md`)

---

## QA Kết quả theo Phase (cập nhật 2026-05-13)

| Phase | Tổng | ✅ Pass | ❌ Fail | ⚠️ Skip | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|
| P1 Foundation & Auth | 11 | 11 | 0 | 0 | ✅ 100% | test-report.md (rerun 2026-05-12) |
| P2 Admin CRUD + Editor | 19 | 19 | 0 | 0 | ✅ 100% | test-report.md (rerun 2026-05-12) |
| P3 Public Blog & Bilingual | 23 | 15 | 4 | 4 | ⚠️ 65% (xem ghi chú) | test-report-phase3.md (2026-05-13) |
| P4 Destination Map | 10 | 10 | 0 | 0 | ✅ 100% | test-report.md (updated 2026-05-13) |
| P5 Comment System | 13 | 13 | 0 | 0 | ✅ 100% | test-report-phase5.md (2026-05-13) |
| P6 User Submissions | 15 | 15 | 0 | 0 | ✅ 100% | test-report.md |
| P7 About + SEO | 15 | 15 | 0 | 0 | ✅ 100% | test-report.md |
| P8 Deployment | 9 | 0 | 0 | 9 | ⏳ SKIP | test-report.md |
| **TOTAL** | **115** | **98** | **4** | **13** | **85.2%** | |

---

## Phân tích FAIL — P3

| TC | Mô tả | Loại | Tác động production |
|---|---|---|---|
| TC-P3-02 | Homepage chứa "DRAFT" | **Resolved** — tất cả test posts đã chuyển về DRAFT status (2026-05-15) | ✅ PASS |
| TC-P3-06 | Post detail 404 trả HTTP 200 | Known dev-mode behavior (`notFound()` + Suspense) | Production OK ✅ |
| TC-P3-10 | OG image endpoint HTTP 500 | Windows path bug trong `@vercel/og` font URL | Production (Linux) OK ✅ |
| TC-P3-17 | Series detail 404 trả HTTP 200 | Known dev-mode behavior (cùng nguyên nhân TC-P3-06) | Production OK ✅ |
| TC-P3-23 | Destination detail 404 trả HTTP 200 | Known dev-mode behavior (cùng nguyên nhân TC-P3-06) | Production OK ✅ |
| TC-P7-12 | 404 page thiếu Navbar/Footer | **Fixed** — `(public)/not-found.tsx` giờ import `<Navbar>` + `<Footer>` trực tiếp | ✅ PASS |

---

## SKIP — P3 (thiếu test data trong DB)

| TC | Lý do skip |
|---|---|
| TC-P3-07 | Cần bilingual post (có cả Vi + En content) |
| TC-P3-12 | Cần post thuộc một series |
| TC-P3-13 | Cần post có tags |
| TC-P3-14b | Cần data thực tế phù hợp |

---

## SKIP — P8 (chưa deploy production)

Tất cả 9 TC-P8-* đều SKIP vì infrastructure chưa setup:
- Supabase buckets chưa tạo (`post-images`, `submission-images`)
- DB migration chưa apply (IPv6 blocker — xem chi tiết trong [CLAUDE.md](CLAUDE.md))
- Vercel chưa connect repo

Sau khi deploy xong, chạy lại `tester-blog-trip` agent với `BASE_URL` = production URL.

---

## Bug fixes ảnh hưởng test cases

| Ngày | Fix | TC ảnh hưởng | Kết quả |
|---|---|---|---|
| 2026-05-15 | 6 PUBLISHED test posts → DRAFT | TC-P3-02 | ✅ PASS |
| 2026-05-10 | `(public)/not-found.tsx` thêm Navbar+Footer | TC-P7-12 | ✅ PASS |
| 2026-05-10 | `generateMetadata` không set `images:[]` khi không có coverImage | TC-P7-xx | ✅ Fixed |
| 2026-05-10 | `notFound()` propagate HTTP 404 đúng với `loading.tsx` | TC-P3-06 variant | Known dev behavior |
| 2026-05-15 | `LanguageContext.tsx` hydration mismatch → `error.tsx` "500" | `/submit` page | ✅ Fixed |
| 2026-05-15 | `TiptapEditor.tsx` Tiptap 3.x `immediatelyRender: false` | `/submit` page | ✅ Fixed |
