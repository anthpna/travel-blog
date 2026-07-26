const VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/gi

export function detectOriginalLang(titleVi: string): 'vi' | 'en' {
  const matches = titleVi.match(VI_DIACRITICS) ?? []
  const ratio = matches.length / (titleVi.replace(/\s/g, '').length || 1)
  return ratio >= 0.08 ? 'vi' : 'en'
}
