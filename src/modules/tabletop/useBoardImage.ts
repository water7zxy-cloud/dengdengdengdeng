import { useEffect, useState } from 'react'

type MapState = { src?: string; error: string | null; progress: number }
type Manifest = { paths: string[]; bytes: number; sha256: string }
const chunked = import.meta.env.VITE_MAP_PARTS === '1'
let state: MapState = { error: null, progress: 0 }
let pending: Promise<void> | undefined
const listeners = new Set<(value: MapState) => void>()
const update = (value: Partial<MapState>) => {
  state = { ...state, ...value }
  listeners.forEach(listener => listener(state))
}

async function fetchAsset(path: string, cache: RequestCache = 'default', signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(90000)
  const response = await fetch(path, { cache, signal: signal ? AbortSignal.any([signal, timeout]) : timeout })
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return response
}

export function preloadBoardImage() {
  if (pending || state.src || state.error) return pending
  pending = (async () => {
    let objectUrl: string | undefined
    try {
      let src = '/assets/map.png'
      if (chunked) {
        const manifest: Manifest = await (await fetchAsset('/assets/map-parts.json', 'no-cache')).json()
        if (!Array.isArray(manifest.paths) || !manifest.paths.length || !manifest.bytes || !manifest.sha256) {
          throw new Error('地图资源清单无效，请刷新以获取最新版本')
        }
        const parts: ArrayBuffer[] = new Array(manifest.paths.length)
        const controller = new AbortController()
        let cursor = 0
        let received = 0
        const worker = async () => {
          while (!controller.signal.aborted && cursor < manifest.paths.length) {
            const index = cursor++
            try {
              parts[index] = await (await fetchAsset(manifest.paths[index], 'force-cache', controller.signal)).arrayBuffer()
            } catch (error) {
              controller.abort(error)
              throw error
            }
            received += parts[index].byteLength
            update({ progress: Math.min(99, Math.floor(received / manifest.bytes * 100)) })
          }
        }
        const results = await Promise.allSettled(Array.from({ length: 3 }, worker))
        const failure = results.find(result => result.status === 'rejected')
        if (failure?.status === 'rejected') throw failure.reason
        const blob = new Blob(parts, { type: 'image/png' })
        if (blob.size !== manifest.bytes) throw new Error('地图下载不完整')
        const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
        const sha256 = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('')
        if (sha256 !== manifest.sha256) throw new Error('地图完整性校验失败')
        objectUrl = URL.createObjectURL(blob)
        src = objectUrl
      }
      const image = new Image()
      image.src = src
      await image.decode()
      update({ src, progress: 100, error: null })
    } catch (error) {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      const message = error instanceof Error ? error.message : String(error)
      console.error('地图资源加载失败', error)
      update({ error: message })
    } finally {
      pending = undefined
    }
  })()
  return pending
}

export function useBoardImage() {
  const [value, setValue] = useState(state)
  useEffect(() => {
    listeners.add(setValue)
    setValue(state)
    void preloadBoardImage()
    return () => { listeners.delete(setValue) }
  }, [])
  const retry = () => {
    if (pending) return
    update({ error: null, progress: 0 })
    void preloadBoardImage()
  }
  return { ...value, retry }
}
