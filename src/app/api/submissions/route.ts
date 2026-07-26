import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notifyAdminSubmission } from '@/lib/resend'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const submissions = await prisma.submission.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(submissions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { titleVi, contentVi, contentHtmlVi, excerptVi, coverImage, authorName, authorEmail } = body

  if (!titleVi?.trim() || !authorName?.trim() || !authorEmail?.trim() || !contentVi || !contentHtmlVi) {
    return NextResponse.json({ error: 'Thiếu trường bắt buộc' }, { status: 400 })
  }

  const submission = await prisma.submission.create({
    data: {
      titleVi: titleVi.trim(),
      contentVi,
      contentHtmlVi,
      excerptVi: excerptVi?.trim() || null,
      coverImage: coverImage || null,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
    },
  })

  await notifyAdminSubmission({
    authorName: authorName.trim(),
    authorEmail: authorEmail.trim(),
    titleVi: titleVi.trim(),
  })

  return NextResponse.json(submission, { status: 201 })
}
