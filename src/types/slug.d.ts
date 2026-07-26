declare module 'slug' {
  function slug(input: string, options?: { locale?: string; [key: string]: unknown }): string
  export = slug
}
