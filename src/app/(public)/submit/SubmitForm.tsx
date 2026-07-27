'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import SafeImage from '@/components/ui/SafeImage'
import type { JSONContent } from '@tiptap/react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useLang } from '@/contexts/LanguageContext'

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false })

const extensions = [StarterKit, TiptapImage, Link]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function SubmitForm() {
  const { t } = useLang()
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [titleVi, setTitleVi] = useState('')
  const [excerptVi, setExcerptVi] = useState('')
  // `coverImage` = gia tri LUU vao DB (co the la ref `storage://...` cua bucket private)
  // `coverPreview` = URL HIEN THI (signed URL do API tra ve) - hai gia tri co the khac nhau
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [contentVi, setContentVi] = useState<JSONContent | null>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert(t.submit.errorTooLarge)
      return
    }
    setCoverUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'submission-images')
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (res.ok) {
      const { url, previewUrl } = await res.json()
      setCoverImage(url)
      setCoverPreview(previewUrl ?? url)
    }
    setCoverUploading(false)
    e.target.value = ''
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!authorName.trim() || !authorEmail.trim() || !titleVi.trim() || !contentVi) {
      setErrorMsg(t.submit.errorRequired)
      return
    }

    const contentHtmlVi = generateHTML(contentVi, extensions)

    setFormState('submitting')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          titleVi: titleVi.trim(),
          excerptVi: excerptVi.trim() || null,
          coverImage,
          contentVi,
          contentHtmlVi,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? t.submit.errorFailed)
      }

      setFormState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.submit.errorGeneral)
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">{t.submit.successTitle}</h2>
        <p className="text-green-700 text-sm leading-relaxed">{t.submit.successMsg}</p>
        <button
          onClick={() => {
            setFormState('idle')
            setAuthorName(''); setAuthorEmail(''); setTitleVi('')
            setExcerptVi(''); setCoverImage(null); setCoverPreview(null); setContentVi(null)
          }}
          className="mt-5 text-sm text-green-700 underline hover:no-underline"
        >
          {t.submit.buttonAnother}
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.submit.title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed">{t.submit.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Author info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            {t.submit.sectionAuthor}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.submit.fieldName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Post metadata */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            {t.submit.sectionPost}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.submit.fieldTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titleVi}
              onChange={(e) => setTitleVi(e.target.value)}
              placeholder="Hành trình khám phá Sapa 4 ngày 3 đêm..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.submit.fieldExcerpt}{' '}
              <span className="text-gray-400 font-normal">{t.submit.excerptHint}</span>
            </label>
            <textarea
              value={excerptVi}
              onChange={(e) => setExcerptVi(e.target.value)}
              placeholder="Mô tả ngắn về hành trình của bạn..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.submit.fieldCover}{' '}
              <span className="text-gray-400 font-normal">{t.submit.coverHint}</span>
            </label>
            {coverImage ? (
              <div className="relative w-full h-44 rounded-lg overflow-hidden border border-gray-200 group">
                <SafeImage src={coverPreview} alt="Cover" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverImage(null); setCoverPreview(null) }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t.submit.coverDelete}
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                coverUploading ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}>
                <span className="text-sm text-gray-400">
                  {coverUploading ? t.submit.coverUploading : t.submit.coverChoose}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={coverUploading}
                  onChange={handleCoverUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            {t.submit.sectionContent} <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-400">{t.submit.contentHint}</p>
          <TiptapEditor
            valueVi={contentVi}
            valueEn={null}
            viOnly
            onChange={(lang, json) => { if (lang === 'vi') setContentVi(json) }}
          />
        </div>

        {/* Error */}
        {(formState === 'error' || errorMsg) && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errorMsg || t.submit.errorGeneral}
          </p>
        )}

        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formState === 'submitting' ? t.submit.buttonSubmitting : t.submit.buttonSubmit}
        </button>
      </form>
    </>
  )
}
