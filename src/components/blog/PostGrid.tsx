'use client'

import PostCard from './PostCard'
import { useLang } from '@/contexts/LanguageContext'

type Post = Parameters<typeof PostCard>[0]['post']

type GridVariant = 'standard' | 'asymmetric-left' | 'asymmetric-right'

interface PostGridProps {
  posts: Post[]
  emptyMessage?: string
  variant?: GridVariant
}

function StandardGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} size="default" />
      ))}
    </div>
  )
}

// 1 large card (col-span-3) left + 2 small cards (col-span-2) stacked right
function AsymmetricLeft({ posts }: { posts: Post[] }) {
  const [main, ...rest] = posts
  const side = rest.slice(0, 2)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <PostCard post={main} size="large" />
      </div>
      {side.length > 0 && (
        <div className="lg:col-span-2 flex flex-col gap-6">
          {side.map((post) => (
            <div key={post.slug} className="flex-1">
              <PostCard post={post} size="small" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 3 small cards (col-span-2) stacked left + 1 large card (col-span-3) right
function AsymmetricRight({ posts }: { posts: Post[] }) {
  const side = posts.slice(0, 3)
  const main = posts[3]
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        {side.map((post) => (
          <div key={post.slug} className="flex-1">
            <PostCard post={post} size="small" />
          </div>
        ))}
      </div>
      <div className="lg:col-span-3">
        <PostCard post={main} size="large" />
      </div>
    </div>
  )
}

export default function PostGrid({
  posts,
  emptyMessage,
  variant = 'standard',
}: PostGridProps) {
  const { t } = useLang()
  if (posts.length === 0) {
    return <p className="text-center text-gray-400 py-16">{emptyMessage ?? t.post.noPostsFound}</p>
  }

  // Fallback về standard nếu không đủ post cho variant
  if (variant === 'asymmetric-left' && posts.length >= 3) {
    return <AsymmetricLeft posts={posts} />
  }
  if (variant === 'asymmetric-right' && posts.length >= 4) {
    return <AsymmetricRight posts={posts} />
  }

  return <StandardGrid posts={posts} />
}
