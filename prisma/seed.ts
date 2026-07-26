import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ===== Tham so cau hinh (khong hardcode trong logic nghiep vu) =====
const BCRYPT_ROUNDS = 12          // do manh hash bcrypt (khop voi auth.ts)
const MIN_PASSWORD_LENGTH = 8     // do dai mat khau toi thieu
const VALID_ROLES = ['ADMIN', 'EDITOR'] as const
type Role = (typeof VALID_ROLES)[number]

// ===== Doc tham so tu CLI (--key=value) =====
// Ho tro chay: npx prisma db seed -- --email=... --password=... --name=... --role=... --update
function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/)
    if (m) {
      out[m[1]] = m[2]
    } else if (a === '--update' || a === '--force') {
      out.update = 'true' // cho phep cap nhat (reset password) neu user da ton tai
    }
  }
  return out
}

// ===== Resolve cau hinh: CLI uu tien hon env =====
function resolveConfig() {
  const args = parseArgs(process.argv.slice(2))

  const email = (args.email ?? process.env.SEED_ADMIN_EMAIL ?? '').trim()
  const password = args.password ?? process.env.SEED_ADMIN_PASSWORD ?? ''
  const name = (args.name ?? process.env.SEED_ADMIN_NAME ?? 'Administrator').trim()
  const role = (args.role ?? process.env.SEED_ADMIN_ROLE ?? 'ADMIN').toUpperCase()
  const doUpdate = args.update === 'true' || process.env.SEED_ADMIN_UPDATE === 'true'

  return { email, password, name, role, doUpdate }
}

// ===== Kiem tra hop le dau vao =====
function validate(cfg: ReturnType<typeof resolveConfig>): string[] {
  const errors: string[] = []
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!cfg.email) errors.push('Thieu email (dat --email hoac SEED_ADMIN_EMAIL)')
  else if (!emailRe.test(cfg.email)) errors.push(`Email khong hop le: ${cfg.email}`)

  if (!cfg.password) errors.push('Thieu password (dat --password hoac SEED_ADMIN_PASSWORD)')
  else if (cfg.password.length < MIN_PASSWORD_LENGTH)
    errors.push(`Password phai it nhat ${MIN_PASSWORD_LENGTH} ky tu`)

  if (!VALID_ROLES.includes(cfg.role as Role))
    errors.push(`Role khong hop le: ${cfg.role} (chi chap nhan ${VALID_ROLES.join(' | ')})`)

  return errors
}

async function main() {
  const cfg = resolveConfig()

  // Validate — khong bao gio log gia tri password
  const errors = validate(cfg)
  if (errors.length > 0) {
    console.error('[seed-admin] Cau hinh khong hop le:')
    errors.forEach((e) => console.error(`  - ${e}`))
    throw new Error('Seed admin bi huy do cau hinh khong hop le')
  }

  const role = cfg.role as Role
  console.log(`[seed-admin] Bat dau — email=${cfg.email}, name="${cfg.name}", role=${role}, update=${cfg.doUpdate}`)

  const existing = await prisma.user.findUnique({ where: { email: cfg.email } })

  // Neu user da ton tai va khong yeu cau cap nhat -> bo qua (khong ghi de)
  if (existing && !cfg.doUpdate) {
    console.log(`[seed-admin] User ${cfg.email} da ton tai — bo qua. Them --update de reset password/name/role.`)
    return
  }

  // Hash password (tac vu quan trong)
  const passwordHash = await bcrypt.hash(cfg.password, BCRYPT_ROUNDS)

  if (existing) {
    // Cap nhat: reset password + name + role cho user hien co
    const user = await prisma.user.update({
      where: { email: cfg.email },
      data: { passwordHash, name: cfg.name, role },
    })
    console.log(`[seed-admin] Da CAP NHAT admin: ${user.email} (id: ${user.id}) — password da doi.`)
  } else {
    // Tao moi
    const user = await prisma.user.create({
      data: { email: cfg.email, passwordHash, name: cfg.name, role },
    })
    console.log(`[seed-admin] Da TAO admin: ${user.email} (id: ${user.id})`)
  }
}

main()
  .catch((e) => {
    console.error('[seed-admin] Loi:', e instanceof Error ? e.message : e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
