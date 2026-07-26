interface PostBodyProps {
  html: string
}

export default function PostBody({ html }: PostBodyProps) {
  return (
    <div
      className="post-body prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
