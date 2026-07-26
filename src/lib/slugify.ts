import slugify from 'slug'

export function toSlug(text: string): string {
  return slugify(text, { locale: 'vi' })
}
