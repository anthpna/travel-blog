import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notifyAdminComment } from '@/lib/resend'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comments = await prisma.comment.findMany({
    include: { post: { select: { id: true, titleVi: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(comments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { postId, name, email, content } = body

  if (!postId || !name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Thiếu trường bắt buộc' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, status: 'PUBLISHED' },
    select: { id: true, titleVi: true },
  })

  if (!post) {
    return NextResponse.json({ error: 'Bài viết không tồn tại' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      name: name.trim(),
      email: email?.trim() ?? '',
      content: content.trim(),
    },
  })

  await notifyAdminComment({
    postTitle: post.titleVi,
    commenterName: name.trim(),
    content: content.trim(),
  })

  return NextResponse.json(comment, { status: 201 })
}
