'use client'

import { useLang } from '@/contexts/LanguageContext'

interface Props {
  titleVi: string
  titleEn?: string | null
}

export default function PostTitleClient({ titleVi, titleEn }: Props) {
  const { lang } = useLang()
  const title = lang === 'en' && titleEn ? titleEn : titleVi
  return <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">{title}</h1>
}
