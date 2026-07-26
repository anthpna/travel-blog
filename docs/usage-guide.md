# Hướng dẫn sử dụng — blog-trip

Tài liệu vận hành cho các tác vụ thường dùng. Xem thêm: [deploy.md](deploy.md) (deploy Vercel/Supabase), [technical.md](technical.md) (kiến trúc).

---

## 1. Seed / tạo tài khoản admin

Đăng nhập hệ thống bằng **email** + password. Script `prisma/seed.ts` cho phép tùy chọn email, password, tên hiển thị và vai trò qua **CLI args** hoặc **biến môi trường** (CLI ưu tiên).

### Tham số

| Tham số | Flag CLI | Biến môi trường | Bắt buộc | Mặc định |
|---|---|---|---|---|
| Tên đăng nhập | `--email=` | `SEED_ADMIN_EMAIL` | ✅ | — |
| Mật khẩu (≥ 8 ký tự) | `--password=` | `SEED_ADMIN_PASSWORD` | ✅ | — |
| Tên hiển thị | `--name=` | `SEED_ADMIN_NAME` | ❌ | `Administrator` |
| Vai trò (`ADMIN`/`EDITOR`) | `--role=` | `SEED_ADMIN_ROLE` | ❌ | `ADMIN` |
| Cho phép reset khi trùng email | `--update` | `SEED_ADMIN_UPDATE=true` | ❌ | skip (không ghi đè) |

### Lệnh

```bash
# Tao admin moi (email + password + ten tuy chon)
npx prisma db seed -- --email="you@site.com" --password="MatKhauManh123" --name="Phan Thanh An"

# Tao EDITOR thay vi ADMIN
npx prisma db seed -- --email="editor@site.com" --password="MatKhau456" --role=EDITOR

# Reset password cho admin da ton tai (bat buoc them --update)
npx prisma db seed -- --email="you@site.com" --password="MatKhauMoi789" --update

# Cach 2: dien SEED_ADMIN_* trong .env roi chay
npx prisma db seed
```

### Lưu ý
- **PowerShell + mật khẩu có ký tự đặc biệt** (`@ $ ! ``): dùng **nháy đơn** để tránh bị diễn giải — `--password='P@ss$word1'`.
- Seed ghi vào DB mà `DATABASE_URL` đang trỏ tới. Nếu `.env` đang trỏ **Supabase production** thì admin được tạo trên DB thật.
- Script **không** ghi log giá trị password. Nếu email đã tồn tại và không có `--update`, script bỏ qua (không ghi đè).

---

## 2. Build & chạy container (Docker)

Dự án có `output: 'standalone'` nên đóng gói được thành image nhỏ gọn. Dùng cho self-host (VPS) hoặc chạy thử production cục bộ. *(Deploy chính vẫn khuyến nghị Vercel — xem deploy.md.)*

### Chuẩn bị
```bash
cp .env.docker.example .env.docker   # roi dien gia tri that vao .env.docker
```

### Cách A — Docker Compose (khuyến nghị)
Compose đọc `.env.docker` cho cả build args lẫn runtime:
```bash
docker compose build      # build image blog-trip:latest
docker compose up -d      # chay, mo http://localhost:3000
docker compose logs -f    # xem log
docker compose down       # dung
```

### Cách B — Docker thuần
```bash
# Build (truyen bien build-time)
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_xxx" \
  --build-arg DATABASE_URL="postgresql://...pooler...:6543/postgres?pgbouncer=true" \
  -t blog-trip:latest .

# Run (truyen bien runtime)
docker run -d -p 3000:3000 --env-file .env.docker --name blog-trip blog-trip:latest
```

### Vì sao cần biến lúc build
- `NEXT_PUBLIC_*` bị **inline vào client bundle** khi `next build` → phải có mặt lúc build.
- `DATABASE_URL` cần lúc build vì `generateStaticParams` (SSG) **truy vấn DB** để pre-render các post PUBLISHED.

### ⚠️ Bảo mật
- `DATABASE_URL` truyền qua `--build-arg` sẽ **lưu trong layer history** của image. Nếu image được chia sẻ, coi như lộ. Với image nội bộ thì chấp nhận được; nếu cần chặt hơn, dùng **BuildKit secrets** (`--secret`) thay cho build-arg.
- `.env.docker` chứa secret thật → **không commit** (đã nằm trong `.gitignore`). Chỉ commit `.env.docker.example`.

### Kiến trúc image (multi-stage)
```
base (node:20-slim + openssl)
 ├─ deps     : npm ci  → postinstall chay prisma generate
 ├─ builder  : next build → .next/standalone
 └─ runner   : copy standalone + static + public + prisma engine
               chay bang user non-root (nextjs), CMD node server.js
```

### Migration & seed với container
Image runtime **không** kèm Prisma CLI (devDependency). Chạy migration/seed **ngoài** container:
- Migration: Supabase SQL Editor (xem deploy.md Phase B) hoặc `npx prisma migrate deploy` từ máy có DevDeps.
- Seed admin: chạy lệnh ở Mục 1 từ máy dev trỏ tới cùng `DATABASE_URL`.
