/**
 * Module logging chung - dung cho ca server (API route, lib) lan client component.
 *
 * Muc dich: thay cac `console.log` rai rac bang mot format thong nhat, co the loc
 * theo muc va theo module, thuan tien trace loi tren Vercel Logs.
 *
 * Format moi dong:
 *   2026-07-27T09:12:33.123Z INFO  [blog-trip:image-upload] Upload thanh cong bucket=post-images
 *
 * QUY UOC: KHONG bao gio truyen du lieu nhay cam (mat khau, token, API key, email
 * nguoi dung) vao logger. Chi log dinh danh khong dinh danh ca nhan (id, bucket, path).
 */

import {
  CURRENT_LOG_LEVEL,
  LOG_LEVEL_WEIGHT,
  LOG_PREFIX,
  type LogLevel,
} from '@/config/logging'

// Nguong hien tai, tinh mot lan
const threshold = LOG_LEVEL_WEIGHT[CURRENT_LOG_LEVEL]

/** Ham xuat thuc te tuong ung tung muc log */
const sink: Record<LogLevel, (...args: unknown[]) => void> = {
  DEBUG: console.debug,
  INFO: console.info,
  WARN: console.warn,
  ERROR: console.error,
}

function write(level: LogLevel, moduleName: string, message: string, meta?: unknown) {
  // Bo qua neu duoi nguong cau hinh
  if (LOG_LEVEL_WEIGHT[level] < threshold) return

  const line = `${new Date().toISOString()} ${level.padEnd(5)} [${LOG_PREFIX}:${moduleName}] ${message}`
  if (meta === undefined) sink[level](line)
  else sink[level](line, meta)
}

export interface Logger {
  debug(message: string, meta?: unknown): void
  info(message: string, meta?: unknown): void
  warn(message: string, meta?: unknown): void
  /** Voi loi co exception, truyen `err` vao `meta` de giu stack trace */
  error(message: string, meta?: unknown): void
}

/**
 * Tao logger gan voi mot module cu the.
 * @param moduleName - ten module nguon, vd 'image-upload', 'api/upload'
 */
export function createLogger(moduleName: string): Logger {
  return {
    debug: (message, meta) => write('DEBUG', moduleName, message, meta),
    info: (message, meta) => write('INFO', moduleName, message, meta),
    warn: (message, meta) => write('WARN', moduleName, message, meta),
    error: (message, meta) => write('ERROR', moduleName, message, meta),
  }
}
