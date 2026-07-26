import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { toSlug } from '@/lib/slugify'
import { calcReadingTime } from '@/lib/reading-time'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import type { JSONContent } from '@tiptap/core'

const extensions = [StarterKit, Image, Link]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'PUBLISHED'
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 20)
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: status as never },
      include: { destination: true, series: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.post.count({ where: { status: status as never } }),
  ])

  return NextResponse.json({ posts, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    titleVi, titleEn,
    excerptVi, excerptEn,
    contentVi, contentEn,
    coverImage,
    status,
    featured,
    destinationId, seriesId, seriesOrder,
    tagIds,
  } = body

  if (!titleVi || !excerptVi || !contentVi) {
    return NextResponse.json({ error: 'Thiếu trường bắt buộc' }, { status: 400 })
  }

  const contentHtmlVi = generateHTML(contentVi as JSONContent, extensions)
  const contentHtmlEn = contentEn ? generateHTML(contentEn as JSONContent, extensions) : null
  const readingTime = calcReadingTime(contentHtmlVi)

  let slug = toSlug(titleVi)
  const existing = await prisma.post.count({ where: { slug } })
  if (existing > 0) slug = `${slug}-${Date.now()}`

  const post = await prisma.post.create({
    data: {
      titleVi, titleEn: titleEn || null,
      slug,
      excerptVi, excerptEn: excerptEn || null,
      contentVi, contentHtmlVi,
      contentEn: contentEn || null,
      contentHtmlEn,
      coverImage: coverImage || null,
      status: status ?? 'DRAFT',
      featured: featured ?? false,
      readingTime,
      authorId: session.user!.id as string,
      destinationId: destinationId || null,
      seriesId: seriesId || null,
      seriesOrder: seriesOrder ? Number(seriesOrder) : null,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      tags: tagIds?.length ? { connect: tagIds.map((id: string) => ({ id })) } : undefined,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
