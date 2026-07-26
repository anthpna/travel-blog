'use client'

import { useLang } from '@/contexts/LanguageContext'

interface Comment {
  id: string
  name: string
  content: string
  createdAt: Date | string
}

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  const { t, lang } = useLang()

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-900">
        {t.comments.title}
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>
        )}
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">{t.comments.noComments}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                  {comment.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-800">{comment.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-9">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
