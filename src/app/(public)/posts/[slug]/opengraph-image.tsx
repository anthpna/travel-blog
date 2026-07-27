import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma'
import { SITE_NAME, SITE_AUTHOR } from '@/config/site'

export const runtime = 'nodejs'
export const revalidate = 3600
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { slug: string }
}

export default async function PostOGImage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED' },
    select: { titleVi: true, excerptVi: true, coverImage: true },
  })

  const title = post?.titleVi ?? SITE_NAME
  const excerpt = post?.excerptVi ?? SITE_AUTHOR

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#111827',
          position: 'relative',
        }}
      >
        {post?.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            padding: '48px 60px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#FCD34D',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 16,
            }}
          >
            {SITE_NAME} · {SITE_AUTHOR}
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: 16,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#D1D5DB',
              maxWidth: 800,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {excerpt}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
