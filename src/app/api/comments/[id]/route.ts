import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  if (!['APPROVED', 'SPAM'].includes(status)) {
    return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 })
  }

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { status },
    include: { post: { select: { slug: true } } },
  })

  if (status === 'APPROVED') {
    revalidatePath(`/posts/${comment.post.slug}`)
  }

  return NextResponse.json(comment)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comment = await prisma.comment.findUnique({
    where: { id: params.id },
    include: { post: { select: { slug: true } } },
  })

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.comment.delete({ where: { id: params.id } })

  if (comment.status === 'APPROVED') {
    revalidatePath(`/posts/${comment.post.slug}`)
  }

  return NextResponse.json({ ok: true })
}
