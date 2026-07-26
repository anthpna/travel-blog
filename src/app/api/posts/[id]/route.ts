import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calcReadingTime } from '@/lib/reading-time'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import type { JSONContent } from '@tiptap/core'

const extensions = [StarterKit, Image, Link]

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { destination: true, series: true, tags: true, comments: true },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const {
    titleVi, titleEn,
    excerptVi, excerptEn,
    contentVi, contentEn,
    coverImage, status, featured,
    destinationId, seriesId, seriesOrder,
    tagIds,
  } = body

  const contentHtmlVi = contentVi
    ? generateHTML(contentVi as JSONContent, extensions)
    : existing.contentHtmlVi as string
  const contentHtmlEn = contentEn !== undefined
    ? (contentEn ? generateHTML(contentEn as JSONContent, extensions) : null)
    : existing.contentHtmlEn
  const readingTime = contentVi
    ? calcReadingTime(contentHtmlVi)
    : existing.readingTime

  const wasPublished = existing.status === 'PUBLISHED'
  const nowPublished = status === 'PUBLISHED'

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      titleVi: titleVi ?? existing.titleVi,
      titleEn: titleEn !== undefined ? (titleEn || null) : existing.titleEn,
      excerptVi: excerptVi ?? existing.excerptVi,
      excerptEn: excerptEn !== undefined ? (excerptEn || null) : existing.excerptEn,
      contentVi: contentVi ?? existing.contentVi,
      contentHtmlVi,
      contentEn: contentEn !== undefined ? (contentEn || null) : existing.contentEn,
      contentHtmlEn,
      coverImage: coverImage !== undefined ? (coverImage || null) : existing.coverImage,
      status: status ?? existing.status,
      featured: featured ?? existing.featured,
      readingTime,
      destinationId: destinationId !== undefined ? (destinationId || null) : existing.destinationId,
      seriesId: seriesId !== undefined ? (seriesId || null) : existing.seriesId,
      seriesOrder: seriesOrder !== undefined ? (seriesOrder ? Number(seriesOrder) : null) : existing.seriesOrder,
      publishedAt: nowPublished && !wasPublished ? new Date() : existing.publishedAt,
      tags: tagIds !== undefined
        ? { set: tagIds.map((id: string) => ({ id })) }
        : undefined,
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
