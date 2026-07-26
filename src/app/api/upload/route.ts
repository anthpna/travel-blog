import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, type UploadBucket } from '@/lib/image-upload'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const bucket = (form.get('bucket') as UploadBucket | null) ?? 'post-images'

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  if (bucket === 'submission-images' && file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 5MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadImage(buffer, bucket)

  return NextResponse.json({ url })
}
