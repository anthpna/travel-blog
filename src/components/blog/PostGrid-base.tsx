import PostCard from './PostCard'

type Post = Parameters<typeof PostCard>[0]['post']

interface PostGridProps {
  posts: Post[]
  emptyMessage?: string
}

export default function PostGrid({ posts, emptyMessage = 'Chưa có bài viết nào.' }: PostGridProps) {
  if (posts.length === 0) {
    return <p className="text-center text-gray-400 py-16">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
