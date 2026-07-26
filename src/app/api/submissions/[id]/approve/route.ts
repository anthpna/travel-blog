import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { toSlug } from '@/lib/slugify'
import { revalidatePath } from 'next/cache'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import type { JSONContent } from '@tiptap/core'

const extensions = [StarterKit, Image, Link]

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
  })

  if (!submission) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
  if (submission.status !== 'PENDING') {
    return NextResponse.json({ error: 'Bài gửi này đã được xử lý' }, { status: 400 })
  }

  // Re-generate HTML từ JSON để đảm bảo đồng bộ
  const contentHtmlVi = generateHTML(submission.contentVi as JSONContent, extensions)

  // Tính reading time
  const wordCount = contentHtmlVi.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  // Tạo slug unique
  let slug = toSlug(submission.titleVi)
  const existing = await prisma.post.count({ where: { slug } })
  if (existing > 0) slug = `${slug}-${Date.now()}`

  // authorId từ session (JWT callback đã map token.sub → session.user.id)
  const authorId = session.user!.id as string
  if (!authorId) return NextResponse.json({ error: 'Session không hợp lệ' }, { status: 401 })

  try {
    // Atomic transaction: tạo Post + cập nhật Submission status
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          titleVi: submission.titleVi,
          titleEn: submission.titleEn ?? null,
          slug,
          excerptVi: submission.excerptVi ?? submission.titleVi,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contentVi: submission.contentVi as any,
          contentHtmlVi,
          coverImage: submission.coverImage ?? null,
          status: 'PUBLISHED',
          featured: false,
          readingTime,
          publishedAt: new Date(),
          authorId,
        },
      }),
      prisma.submission.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      }),
    ])

    // Gắn postId vào submission (sau transaction vì cần post.id)
    await prisma.submission.update({
      where: { id: params.id },
      data: { postId: post.id },
    })

    revalidatePath('/')
    revalidatePath('/posts')
    revalidatePath(`/posts/${slug}`)

    return NextResponse.json({ post, submissionId: params.id })
  } catch (err) {
    console.error('[approve-submission]', err)
    return NextResponse.json(
      { error: 'Lỗi khi duyệt bài', detail: String(err) },
      { status: 500 }
    )
  }
}
