import type { Metadata } from 'next'
import SubmitForm from './SubmitForm'

export const metadata: Metadata = {
  title: 'Gửi bài viết — Blog Trip',
  description: 'Chia sẻ hành trình của bạn với cộng đồng Blog Trip.',
}

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <SubmitForm />
    </div>
  )
}
