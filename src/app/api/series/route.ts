import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { toSlug } from '@/lib/slugify'

export async function GET() {
  const series = await prisma.series.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(series)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { titleVi, titleEn, description, coverImage } = body

  if (!titleVi) {
    return NextResponse.json({ error: 'Tên series (tiếng Việt) là bắt buộc' }, { status: 400 })
  }

  let slug = toSlug(titleVi)
  const existing = await prisma.series.count({ where: { slug } })
  if (existing > 0) slug = `${slug}-${Date.now()}`

  const series = await prisma.series.create({
    data: { titleVi, titleEn: titleEn || null, slug, description: description || null, coverImage: coverImage || null },
  })

  return NextResponse.json(series, { status: 201 })
}
