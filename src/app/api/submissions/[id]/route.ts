import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { status, adminNotes } = body

  if (!status || !['PENDING', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 })
  }

  const submission = await prisma.submission.update({
    where: { id: params.id },
    data: {
      status,
      adminNotes: adminNotes ?? undefined,
      reviewedAt: status === 'REJECTED' ? new Date() : undefined,
    },
  })

  return NextResponse.json(submission)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
  })

  if (!submission) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })

  return NextResponse.json(submission)
}
