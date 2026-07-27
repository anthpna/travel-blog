/**
 * Cau hinh logging chung cua ung dung.
 *
 * Muc log lay tu bien moi truong `LOG_LEVEL`; neu khong khai bao thi mac dinh:
 *   - production : INFO  (bo qua DEBUG cho do nhieu)
 *   - development: DEBUG (xem day du de trace)
 */

export const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const
export type LogLevel = (typeof LOG_LEVELS)[number]

// Thu tu uu tien - chi ghi log co muc >= nguong cau hinh
export const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
}

function resolveLevel(): LogLevel {
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase()
  if (raw && (LOG_LEVELS as readonly string[]).includes(raw)) return raw as LogLevel
  return process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'
}

// Nguong log hien tai
export const CURRENT_LOG_LEVEL: LogLevel = resolveLevel()

// Tien to chung cho moi dong log, giup loc nhanh trong console/Vercel logs
export const LOG_PREFIX = 'blog-trip'
