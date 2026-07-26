import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { nameVi, nameEn, country, countryCode, lat, lng, coverImage } = body

  const destination = await prisma.destination.update({
    where: { id: params.id },
    data: {
      nameVi, nameEn, country, countryCode,
      lat: Number(lat), lng: Number(lng),
      coverImage: coverImage || null,
    },
  })

  return NextResponse.json(destination)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.destination.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
