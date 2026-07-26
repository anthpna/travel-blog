'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useCallback } from 'react'
import type { JSONContent } from '@tiptap/react'

interface TiptapEditorProps {
  valueVi: JSONContent | null
  valueEn: JSONContent | null
  onChange: (lang: 'vi' | 'en', json: JSONContent) => void
  viOnly?: boolean
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  const btn = (active: boolean, action: () => void, label: string) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action() }}
      className={`px-2 py-1 text-sm rounded border ${
        active
          ? 'bg-gray-800 text-white border-gray-800'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
      {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'S̶')}
      <div className="w-px bg-gray-200 mx-1" />
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
      {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
      <div className="w-px bg-gray-200 mx-1" />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• List')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. List')}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), '❝')}
      <div className="w-px bg-gray-200 mx-1" />
      <ImageButton editor={editor} />
    </div>
  )
}

function ImageButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const upload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'post-images')

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) return
    const { url } = await res.json()
    editor.chain().focus().setImage({ src: url }).run()
    e.target.value = ''
  }, [editor])

  return (
    <label className="px-2 py-1 text-sm rounded border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer">
      Ảnh
      <input type="file" accept="image/*" className="hidden" onChange={upload} />
    </label>
  )
}

function EditorPane({
  content,
  placeholder,
  onChange,
}: {
  content: JSONContent | null
  placeholder: string
  onChange: (json: JSONContent) => void
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ?? undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON())
    },
  })

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[300px] p-4 focus-within:outline-none"
      />
    </div>
  )
}

export default function TiptapEditor({ valueVi, valueEn, onChange, viOnly = false }: TiptapEditorProps) {
  const [tab, setTab] = useState<'vi' | 'en'>('vi')

  if (viOnly) {
    return (
      <EditorPane
        content={valueVi}
        placeholder="Viết nội dung tiếng Việt..."
        onChange={(json) => onChange('vi', json)}
      />
    )
  }

  return (
    <div>
      <div className="flex gap-0 mb-0 border-b border-gray-200">
        {(['vi', 'en'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setTab(lang)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === lang
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {lang === 'vi' ? 'Tiếng Việt (bắt buộc)' : 'English (tùy chọn)'}
          </button>
        ))}
      </div>

      <div className={tab === 'vi' ? 'block' : 'hidden'}>
        <EditorPane
          content={valueVi}
          placeholder="Viết nội dung tiếng Việt..."
          onChange={(json) => onChange('vi', json)}
        />
      </div>
      <div className={tab === 'en' ? 'block' : 'hidden'}>
        <EditorPane
          content={valueEn}
          placeholder="Write English content (optional)..."
          onChange={(json) => onChange('en', json)}
        />
      </div>
    </div>
  )
}
