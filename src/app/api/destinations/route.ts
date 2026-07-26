import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { toSlug } from '@/lib/slugify'

export async function GET() {
  const destinations = await prisma.destination.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { nameVi: 'asc' },
  })
  return NextResponse.json(destinations)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { nameVi, nameEn, country, countryCode, lat, lng, coverImage } = body

  if (!nameVi || !nameEn || !country || !countryCode || lat == null || lng == null) {
    return NextResponse.json({ error: 'Thiếu trường bắt buộc' }, { status: 400 })
  }

  let slug = toSlug(nameVi)
  const existing = await prisma.destination.count({ where: { slug } })
  if (existing > 0) slug = `${slug}-${Date.now()}`

  const destination = await prisma.destination.create({
    data: { nameVi, nameEn, slug, country, countryCode, lat: Number(lat), lng: Number(lng), coverImage: coverImage || null },
  })

  return NextResponse.json(destination, { status: 201 })
}
