import type { Metadata } from 'next'
import SubmitForm from './SubmitForm'
import { SITE_NAME } from '@/config/site'

export const metadata: Metadata = {
  title: `Gửi bài viết — ${SITE_NAME}`,
  description: `Chia sẻ hành trình của bạn với cộng đồng ${SITE_NAME}.`,
}

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <SubmitForm />
    </div>
  )
}
