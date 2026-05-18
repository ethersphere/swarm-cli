import { Bee, MantarayNode, MerkleTree, Reference } from '@ethersphere/bee-js'
import { Chunk, System } from 'cafe-utility'
import * as FS from 'fs'
import { join, sep } from 'path'
import { getMime } from './mime'

export interface ChunkedUploadProgress {
  total: number
  processed: number
}

export interface ChunkedUploadOptions {
  pin?: boolean
  deferred?: boolean
  maxRetries?: number
  retryBaseDelayMs?: number
  onProgress?: (progress: ChunkedUploadProgress) => void
  onRetry?: (attempt: number, error: unknown) => void
}

export interface ChunkedFolderOptions extends ChunkedUploadOptions {
  indexDocument?: string
  errorDocument?: string
}

const NULL_REFERENCE_BYTES = new Uint8Array(32)

async function uploadChunkWithRetry(
  bee: Bee,
  stamp: string,
  chunkData: Uint8Array,
  options: ChunkedUploadOptions,
): Promise<void> {
  const maxRetries = options.maxRetries ?? 3
  const baseDelay = options.retryBaseDelayMs ?? 500
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await bee.uploadChunk(stamp, chunkData, { pin: options.pin, deferred: options.deferred })

      return
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        options.onRetry?.(attempt + 1, error)
        await System.sleepMillis(baseDelay * 2 ** attempt)
      }
    }
  }

  throw lastError
}

function totalLeafChunks(size: number): number {
  if (size === 0) {
    return 1
  }

  return Math.ceil(size / 4096)
}

async function streamFileToMerkleTree(filePath: string, onChunk: (chunk: Chunk) => Promise<void>): Promise<Chunk> {
  const tree = new MerkleTree(onChunk)
  const readable = FS.createReadStream(filePath)

  for await (const data of readable) {
    await tree.append(data as Uint8Array)
  }

  return tree.finalize()
}

export async function uploadChunkedData(
  bee: Bee,
  stamp: string,
  data: Uint8Array,
  options: ChunkedUploadOptions = {},
): Promise<Reference> {
  let processed = 0
  const total = totalLeafChunks(data.length)
  options.onProgress?.({ total, processed })

  const onChunk = async (chunk: Chunk) => {
    await uploadChunkWithRetry(bee, stamp, chunk.build(), options)
    processed += 1
    options.onProgress?.({ total: Math.max(total, processed), processed })
  }

  const tree = new MerkleTree(onChunk)
  await tree.append(data)
  const root = await tree.finalize()

  return new Reference(root.hash())
}

export async function uploadChunkedFile(
  bee: Bee,
  stamp: string,
  filePath: string,
  name: string | undefined,
  contentType: string | undefined,
  options: ChunkedUploadOptions = {},
): Promise<Reference> {
  const size = FS.statSync(filePath).size
  let processed = 0
  const total = totalLeafChunks(size)
  options.onProgress?.({ total, processed })

  const onChunk = async (chunk: Chunk) => {
    await uploadChunkWithRetry(bee, stamp, chunk.build(), options)
    processed += 1
    options.onProgress?.({ total: Math.max(total, processed), processed })
  }

  const rootChunk = await streamFileToMerkleTree(filePath, onChunk)
  const rootHash = rootChunk.hash()

  if (!name) {
    return new Reference(rootHash)
  }

  const mime = contentType || getMime(name) || 'application/octet-stream'
  const mantaray = new MantarayNode()
  mantaray.addFork(name, rootHash, {
    'Content-Type': mime,
    Filename: name,
  })
  mantaray.addFork('/', NULL_REFERENCE_BYTES, {
    'website-index-document': name,
  })

  const result = await mantaray.saveRecursively(bee, stamp, {
    pin: options.pin,
    deferred: options.deferred,
  })

  return result.reference
}

interface CollectedFile {
  fsPath: string
  relPath: string
  size: number
}

function collectFiles(root: string, current: string, out: CollectedFile[]): void {
  const absolute = current ? join(root, current) : root
  const entries = FS.readdirSync(absolute, { withFileTypes: true })

  for (const entry of entries) {
    const relPath = current ? join(current, entry.name) : entry.name
    const fsPath = join(absolute, entry.name)

    if (entry.isDirectory()) {
      collectFiles(root, relPath, out)
    } else if (entry.isFile()) {
      out.push({ fsPath, relPath, size: FS.statSync(fsPath).size })
    }
  }
}

export async function uploadChunkedFolder(
  bee: Bee,
  stamp: string,
  dirPath: string,
  options: ChunkedFolderOptions = {},
): Promise<Reference> {
  const files: CollectedFile[] = []
  collectFiles(dirPath, '', files)

  if (files.length === 0) {
    throw new Error(`No files found in directory: ${dirPath}`)
  }

  let total = files.reduce((sum, file) => sum + totalLeafChunks(file.size), 0)
  let processed = 0
  options.onProgress?.({ total, processed })

  const onChunk = async (chunk: Chunk) => {
    await uploadChunkWithRetry(bee, stamp, chunk.build(), options)
    processed += 1
    options.onProgress?.({ total: Math.max(total, processed), processed })
  }

  const mantaray = new MantarayNode()
  let hasIndexHtml = false

  for (const file of files) {
    const manifestPath = file.relPath.split(sep).join('/')
    const rootChunk = await streamFileToMerkleTree(file.fsPath, onChunk)
    const mime = getMime(manifestPath) || 'application/octet-stream'
    const filename = manifestPath.includes('/')
      ? manifestPath.substring(manifestPath.lastIndexOf('/') + 1)
      : manifestPath

    mantaray.addFork(manifestPath, rootChunk.hash(), {
      'Content-Type': mime,
      Filename: filename,
    })

    if (manifestPath === 'index.html') {
      hasIndexHtml = true
    }
  }

  if (hasIndexHtml || options.indexDocument || options.errorDocument) {
    const metadata: Record<string, string> = {}

    if (options.indexDocument) {
      metadata['website-index-document'] = options.indexDocument
    } else if (hasIndexHtml) {
      metadata['website-index-document'] = 'index.html'
    }

    if (options.errorDocument) {
      metadata['website-error-document'] = options.errorDocument
    }
    mantaray.addFork('/', NULL_REFERENCE_BYTES, metadata)
  }

  const result = await mantaray.saveRecursively(bee, stamp, {
    pin: options.pin,
    deferred: options.deferred,
  })

  total = Math.max(total, processed)
  options.onProgress?.({ total, processed })

  return result.reference
}
