import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import PostForm from '@/components/admin/PostForm'

interface Props {
  params: { id: string }
}

export default async function EditPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  })
  if (!post) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa bài viết</h1>
      <PostForm
        initialData={{
          id: post.id,
          titleVi: post.titleVi,
          titleEn: post.titleEn ?? '',
          excerptVi: post.excerptVi,
          excerptEn: post.excerptEn ?? '',
          contentVi: post.contentVi as never,
          contentEn: post.contentEn as never ?? null,
          coverImage: post.coverImage ?? '',
          status: post.status,
          featured: post.featured,
          destinationId: post.destinationId ?? '',
          seriesId: post.seriesId ?? '',
          seriesOrder: post.seriesOrder?.toString() ?? '',
        }}
      />
    </div>
  )
}
