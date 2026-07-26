export type TagColorConfig = {
  bg: string
  text: string
  hover: string
  activeBg: string
  activeText: string
}

export const TAG_COLORS: Record<string, TagColorConfig> = {
  'du-lich':          { bg: 'bg-blue-100',   text: 'text-blue-700',   hover: 'hover:bg-blue-200',   activeBg: 'bg-blue-600',   activeText: 'text-white' },
  'am-thuc':          { bg: 'bg-green-100',  text: 'text-green-700',  hover: 'hover:bg-green-200',  activeBg: 'bg-green-600',  activeText: 'text-white' },
  'meo-kinh-nghiem':  { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200', activeBg: 'bg-orange-600', activeText: 'text-white' },
  'van-hoa':          { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200', activeBg: 'bg-purple-600', activeText: 'text-white' },
  'tin-tuc':          { bg: 'bg-red-100',    text: 'text-red-700',    hover: 'hover:bg-red-200',    activeBg: 'bg-red-600',    activeText: 'text-white' },
  'phuot':            { bg: 'bg-teal-100',   text: 'text-teal-700',   hover: 'hover:bg-teal-200',   activeBg: 'bg-teal-600',   activeText: 'text-white' },
  'kham-pha':         { bg: 'bg-cyan-100',   text: 'text-cyan-700',   hover: 'hover:bg-cyan-200',   activeBg: 'bg-cyan-600',   activeText: 'text-white' },
  'review':           { bg: 'bg-pink-100',   text: 'text-pink-700',   hover: 'hover:bg-pink-200',   activeBg: 'bg-pink-600',   activeText: 'text-white' },
  'mua-sam':          { bg: 'bg-yellow-100', text: 'text-yellow-700', hover: 'hover:bg-yellow-200', activeBg: 'bg-yellow-600', activeText: 'text-white' },
  'giao-thong':       { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200', activeBg: 'bg-indigo-600', activeText: 'text-white' },
}

export const DEFAULT_TAG_COLOR: TagColorConfig = {
  bg: 'bg-gray-100',
  text: 'text-gray-600',
  hover: 'hover:bg-gray-200',
  activeBg: 'bg-gray-700',
  activeText: 'text-white',
}

export function getTagColor(slug: string): TagColorConfig {
  return TAG_COLORS[slug] ?? DEFAULT_TAG_COLOR
}
