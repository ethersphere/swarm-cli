export type History = {
  timestamp: number
  reference: string
  stamp: string
  path: string | null
  uploadType: 'file' | 'folder' | 'stdin'
  feedAddress?: string | null
  feedIdentity?: string | null
}
