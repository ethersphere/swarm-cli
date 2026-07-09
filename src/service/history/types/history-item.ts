export type HistoryItem = {
  index?: number
  timestamp: number
  reference: string
  stamp: string
  path: string | null
  uploadType: 'file' | 'folder' | 'stdin' | 'reupload'
  feedAddress?: string | null
  feedIdentity?: string | null
}
