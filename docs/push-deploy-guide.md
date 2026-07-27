# Hướng dẫn Push code & Deploy lên Vercel

Tài liệu này mô tả quy trình **lặp lại hằng ngày**: sửa code → push GitHub → lên production.

> Khác với [deploy.md](deploy.md) — file đó là kế hoạch **setup lần đầu** (tạo Supabase, tạo project Vercel, cấu hình env). Nếu hệ thống đã chạy rồi thì dùng file này.

---

## 1. Bối cảnh: deploy diễn ra như thế nào

| Thông tin | Giá trị thực tế |
|---|---|
| Remote | `https://github.com/anthpna/travel-blog.git` |
| Nhánh production | `main` |
| Git root | Chính là thư mục `blog-trip/` (**không phải** monorepo `AI/`) |
| Root Directory trên Vercel | `./` |
| Cơ chế deploy | **Vercel native git deploy** — Vercel tự build khi có commit mới trên `main` |
| Build command | `next build` (qua `vercel.json` → framework `nextjs`) |
| `postinstall` | `prisma generate` — chạy tự động, không cần làm gì |

### Hai đường deploy song song

```
┌─ Đường 1 (MẶC ĐỊNH) ────────────────────────────────┐
│  push lên main  →  Vercel tự phát hiện  →  build     │
│                     →  deploy production             │
└──────────────────────────────────────────────────────┘

┌─ Đường 2 (DỰ PHÒNG, chạy tay) ──────────────────────┐
│  GitHub → tab Actions → "Deploy (Vercel Production)" │
│  → Run workflow                                      │
│  (quality gate → vercel pull → build → deploy)       │
└──────────────────────────────────────────────────────┘
```

Đường 2 nằm ở `.github/workflows/deploy.yml`, để chế độ `workflow_dispatch` nhằm **tránh deploy trùng** với đường 1. Bình thường không cần dùng.

### ⚠️ Cạm bẫy quan trọng nhất

CI (`.github/workflows/ci.yml`) được cấu hình:

```yaml
on:
  pull_request:
  push:
    branches-ignore:
      - main
```

Nghĩa là **push thẳng vào `main` thì CI KHÔNG chạy** — không có lint, không type check, không quét secret. Vercel sẽ build và deploy luôn. Nếu code lỗi, production hỏng.

→ Đây là lý do mục 2 và mục 3 dưới đây tồn tại.

---

## 2. Checklist bắt buộc trước khi push

Chạy từ thư mục `blog-trip/`. **Cả 3 lệnh phải xanh** mới được push.

```bash
npm run lint        # ESLint - phải "No ESLint warnings or errors"
npx tsc --noEmit    # Type check - phải không in ra lỗi nào
npm run build       # Phải "✓ Compiled successfully"
```

Kiểm tra thêm không có gì nhạy cảm hoặc rác lọt vào:

```bash
# 1. Xem chính xác những gì sắp commit
git status --short

# 2. File .env KHÔNG được xuất hiện (đã có trong .gitignore, nhưng vẫn kiểm tra)
git status --porcelain | grep -E "\.env|uploads/" && echo "⚠️ CÓ FILE KHÔNG NÊN COMMIT" || echo "✓ sạch"

# 3. Không có file tạm/script test còn sót
git status --porcelain | grep -E "^\?\? _|\.log$"
```

### Kiểm tra null byte (đã từng gặp)

Đã có tiền lệ file `.mjs` chứa null byte — git coi là **binary**, mất diff và mất merge, nhưng build vẫn pass nên rất dễ lọt.

```bash
python -c "
import os
bad=[]
for root,_,fs in os.walk('src'):
    for f in fs:
        p=os.path.join(root,f)
        if b'\x00' in open(p,'rb').read(): bad.append(p)
print('CAN KIEM TRA:', bad)"
```

Kết quả hợp lệ chỉ gồm file nhị phân thật: `favicon.ico`, `fonts/*.woff`. Có tên file `.ts`/`.tsx`/`.mjs` nào trong danh sách → **phải sửa trước khi push**.

---

## 3. Quy trình push

### 3.1. Cách khuyến nghị — qua nhánh + Pull Request

Chậm hơn vài phút nhưng **CI chạy đầy đủ** (lint + typecheck + gitleaks quét secret toàn bộ lịch sử commit).

```bash
# 1. Tạo nhánh từ main
git checkout -b feat/ten-tinh-nang

# 2. Xem lại thay đổi
git status --short
git diff

# 3. Stage + commit
git add .
git commit -m "feat: mo ta ngan gon thay doi"

# 4. Push nhánh
git push -u origin feat/ten-tinh-nang
```

Sau đó:
1. Vào GitHub → tạo Pull Request vào `main`
2. Đợi CI xanh (tab **Checks**) — nếu đỏ thì sửa rồi push tiếp lên cùng nhánh
3. Vercel tự tạo **Preview Deployment** cho PR → mở link preview kiểm tra thật
4. Preview OK + CI xanh → **Merge**
5. Merge xong Vercel tự deploy production

### 3.2. Cách nhanh — push thẳng `main`

Chỉ dùng cho sửa nhỏ, ít rủi ro. **Bắt buộc** đã chạy hết mục 2 vì không có lưới an toàn nào.

```bash
git checkout main
git pull origin main       # đồng bộ trước, tránh conflict lúc push
git add .
git commit -m "fix: mo ta thay doi"
git push origin main
```

### 3.3. Quy ước commit message

Theo đúng lịch sử commit hiện có của repo (`feat:`, `fix:`, `ci:`), tiếng Việt **không dấu**:

```
feat: them nut upload anh cho form admin
fix: sua loi 400 INVALID_IMAGE_OPTIMIZE_REQUEST tren trang destinations
refactor: gom cau hinh anh vao src/config
docs: cap nhat huong dan deploy
ci: them buoc quet secret
```

Thay đổi lớn nên **tách nhiều commit theo nhóm** thay vì dồn một commit, để dễ revert từng phần khi có sự cố.

---

## 4. Theo dõi deploy

1. Mở [vercel.com](https://vercel.com) → chọn project → tab **Deployments**
2. Commit vừa push xuất hiện với trạng thái `Building`
3. Bấm vào để xem **Build Logs** theo thời gian thực

| Trạng thái | Ý nghĩa |
|---|---|
| `Ready` | Deploy thành công, đã live |
| `Error` | Build lỗi — production **giữ nguyên bản cũ**, không bị hỏng |
| `Canceled` | Bị hủy do có commit mới hơn |

### Kiểm tra sau khi `Ready`

```bash
# Thay <domain> bằng domain production
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/posts
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/destinations
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/series
```

Kiểm tra thủ công trên trình duyệt các phần không test được bằng `curl`:
- Ảnh bìa ở `/destinations` có hiện không (không ra ô vỡ)
- `/admin` đăng nhập được, form ảnh bìa bấm "Tải ảnh lên" hoạt động
- `/submit` upload ảnh xem preview có hiện

### Rollback khi production lỗi

Vercel → **Deployments** → chọn bản `Ready` gần nhất trước đó → menu `···` → **Promote to Production**. Có hiệu lực gần như tức thì, không cần build lại.

Sau khi rollback mới bình tĩnh sửa code rồi push lại.

---

## 5. Các trường hợp cần xử lý thêm

### 5.1. Có thay đổi Prisma schema — ⚠️ CẦN CHÚ Ý

Build script chỉ chạy `next build`, **không** chạy `prisma migrate deploy`. Đổi schema thì phải tự migrate DB production.

**Vấn đề đã tồn tại:** DB production hiện **không có bảng `_prisma_migrations`** — schema được tạo bằng `prisma db push` chứ không qua migration. Chạy `prisma migrate deploy` sẽ lỗi `P3005: database schema is not empty`.

Cần xử lý một lần trước khi có migration đầu tiên:

```bash
# Đánh dấu migration init là "đã áp dụng" mà không chạy lại SQL
npx prisma migrate resolve --applied 20260508170939_init
```

Sau đó quy trình bình thường:

```bash
# Local: tạo migration
npx prisma migrate dev --name mo_ta_thay_doi

# Commit cả thư mục prisma/migrations/
git add prisma/ && git commit -m "feat: them cot X vao bang Y"

# Áp lên production TRƯỚC khi push code
npx prisma migrate deploy

# Rồi mới push
git push origin main
```

> Thứ tự **migrate trước, push code sau** để tránh code mới chạy trên schema cũ.

### 5.2. Thêm biến môi trường mới

Vercel **không** đọc file `.env` trong repo. Phải khai báo tay:

Vercel → project → **Settings** → **Environment Variables** → thêm biến → chọn `Production` → **Save** → vào **Deployments** bấm **Redeploy** (biến mới chỉ áp dụng cho build mới).

Biến `NEXT_PUBLIC_*` được nhúng vào bundle client lúc build → đổi giá trị **bắt buộc** redeploy.

### 5.3. Thêm host ảnh mới

Ảnh từ domain lạ sẽ hiển thị nhưng không được tối ưu. Muốn tối ưu, thêm 1 dòng vào `REMOTE_IMAGE_PATTERNS` trong [`src/config/image-hosts.mjs`](../src/config/image-hosts.mjs):

```js
{ protocol: 'https', hostname: 'ten-mien-moi.com' },
```

Đây là build-time config → **phải deploy lại** mới có hiệu lực. Chi tiết cơ chế: [`.claude/rules/image-upload.md`](../.claude/rules/image-upload.md).

### 5.4. Đổi tên site / thương hiệu

Sửa duy nhất [`src/config/site.ts`](../src/config/site.ts) rồi push. Không sửa rải rác trong component.

---

## 6. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Vercel báo `Error` ngay bước Install | `package.json` và `package-lock.json` lệch nhau | Chạy `npm install` local, commit **cả hai** file |
| Build lỗi type nhưng local vẫn pass | Quên chạy `npx tsc --noEmit`, hoặc Prisma Client cũ | Chạy `npx prisma generate` rồi `npx tsc --noEmit` lại |
| Deploy `Ready` nhưng trang trắng / 500 | Thiếu env var trên Vercel | Xem **Runtime Logs**, đối chiếu Settings → Environment Variables |
| Ảnh lỗi `400 INVALID_IMAGE_OPTIMIZE_REQUEST` | Host ảnh chưa có trong allowlist | Mục 5.3 |
| `git push` bị từ chối (`rejected`) | Remote có commit mới hơn | `git pull --rebase origin main` rồi push lại |
| Đăng nhập admin lỗi sau khi đổi domain | `NEXTAUTH_URL` chưa cập nhật | Sửa env trên Vercel → Redeploy |

Xem log runtime production: Vercel → project → tab **Logs**. Logger của dự án in theo format `timestamp LEVEL [blog-trip:module] message` nên lọc bằng từ khóa `blog-trip:` sẽ ra đúng log ứng dụng.

---

## 7. Tóm tắt một trang

```bash
# ── TRƯỚC KHI PUSH ──────────────────────────
npm run lint && npx tsc --noEmit && npm run build
git status --short

# ── PUSH (khuyến nghị: qua PR) ──────────────
git checkout -b feat/ten-tinh-nang
git add .
git commit -m "feat: mo ta ngan gon"
git push -u origin feat/ten-tinh-nang
# → Tạo PR → đợi CI xanh → xem Preview → Merge

# ── PUSH NHANH (chỉ khi sửa nhỏ) ────────────
git checkout main && git pull origin main
git add . && git commit -m "fix: mo ta"
git push origin main

# ── SAU KHI PUSH ────────────────────────────
# Vercel → Deployments → đợi "Ready" → kiểm tra site
# Lỗi? → Promote deployment cũ về Production
```

**Nếu có đổi Prisma schema:** `prisma migrate deploy` **trước**, push code **sau**.
