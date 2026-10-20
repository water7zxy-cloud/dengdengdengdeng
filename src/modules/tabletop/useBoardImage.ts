import { useEffect, useState } from 'react'

const chunked = import.meta.env.VITE_MAP_PARTS === '1'

export function useBoardImage() {
  const [src, setSrc] = useState<string | undefined>(chunked ? undefined : '/assets/map.png')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!chunked) return
    const controller = new AbortController()
    let objectUrl: string | undefined
    const load = async () => {
      const manifest = await fetch('/assets/map-parts.json', { signal: controller.signal })
      if (!manifest.ok) throw new Error('Map manifest unavailable')
      const paths: string[] = await manifest.json()
      const parts = await Promise.all(paths.map(async path => {
        const response = await fetch(path, { signal: controller.signal })
        if (!response.ok) throw new Error('Map part unavailable')
        return response.arrayBuffer()
      }))
      if (controller.signal.aborted) return
      objectUrl = URL.createObjectURL(new Blob(parts, { type: 'image/png' }))
      setSrc(objectUrl)
    }
    void load().catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [])

  return { src, error }
}
