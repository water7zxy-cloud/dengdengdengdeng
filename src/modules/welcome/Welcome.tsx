import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { coverConfig, playWelcomeAudio } from './config'
import { CoverArtwork } from './CoverArtwork'
import { playButtonSound, playBulbWhoosh } from '../audio/soundtrack'
import './welcome.css'

export function Welcome({ onStart }: { onStart: () => void }) {
  const [textReady, setTextReady] = useState(false)
  const [lighting, setLighting] = useState(false)
  const started = useRef(false)
  const finishTyping = useCallback(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) playBulbWhoosh()
    setTextReady(true)
  }, [])

  useEffect(() => {
    if (!lighting) return
    const timer = window.setTimeout(onStart, coverConfig.lightDurationMs)
    return () => window.clearTimeout(timer)
  }, [lighting, onStart])

  const lightLamp = () => {
    if (started.current || !textReady) return
    started.current = true
    playButtonSound()
    playWelcomeAudio()
    setLighting(true)
  }

  return <main className="welcome">
    <div className="welcome-art" style={{ '--light-duration': `${coverConfig.lightDurationMs}ms` } as CSSProperties}>
      <CoverArtwork onComplete={finishTyping} />
      {lighting && <><span className="welcome-home-glow" aria-hidden="true" /><img className="welcome-home-light" src={coverConfig.image} alt="" aria-hidden="true" /></>}
      {textReady && <div className="welcome-bulb-entry"><div className="welcome-hanging-lamp"><button className="light-button" aria-label={coverConfig.buttonLabel} disabled={lighting} onClick={lightLamp}>
        <svg className="welcome-button-bulb" viewBox="0 0 180 220" aria-hidden="true">
          <g transform="rotate(180 90 110)">
          <path d="M90 10C49 10 20 39 20 77c0 27 15 43 29 60 7 8 9 16 9 25h64c0-9 2-17 9-25 14-17 29-33 29-60 0-38-29-67-70-67Z" fill="#fff200" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 162h60v30l-14 15H74l-14-15Z" fill="#111" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
          <path d="m65 172 50-5m-50 17 50-5m-45 17 38-4" fill="none" stroke="#fff200" strokeWidth="2" strokeLinecap="round" />
          <path d="M81 151 69 124m30 27 12-27" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g transform="translate(90 133) scale(.82 1.2)">
            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#111" fontSize="23" fontWeight="400" letterSpacing="2" fontFamily="Alimama FangYuanTi, PingFang SC, sans-serif">{coverConfig.buttonLabel}</text>
          </g>
        </svg>
      </button></div></div>}
    </div>
  </main>
}
