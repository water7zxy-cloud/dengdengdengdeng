import { useEffect, useRef } from 'react'
import './firefly.css'

export function FireflyCursor() {
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = cursor.current
    if (!element) return
    const mouseAvailable = window.matchMedia('(any-pointer: fine)')
    let frame = 0
    let x = 0
    let y = 0

    const hide = () => {
      cancelAnimationFrame(frame)
      frame = 0
      element.dataset.visible = 'false'
      element.dataset.pressed = 'false'
      document.documentElement.classList.remove('firefly-cursor-active')
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !mouseAvailable.matches) { hide(); return }
      x = event.clientX
      y = event.clientY
      const target = event.target instanceof Element ? event.target : null
      element.dataset.interactive = String(Boolean(target?.closest('button, a, input, select, textarea, [role="button"]')))
      if (frame) return
      frame = requestAnimationFrame(() => {
        element.style.transform = `translate3d(${x - 22}px, ${y - 12}px, 0)`
        element.dataset.visible = 'true'
        document.documentElement.classList.add('firefly-cursor-active')
        frame = 0
      })
    }
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide() }
    const press = (event: PointerEvent) => { if (event.pointerType === 'mouse') element.dataset.pressed = 'true' }
    const release = () => { element.dataset.pressed = 'false' }
    const visibility = () => { if (document.hidden) hide() }

    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerout', leave)
    document.addEventListener('pointerdown', press, { passive: true })
    document.addEventListener('pointerup', release, { passive: true })
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', hide)
    mouseAvailable.addEventListener('change', hide)
    return () => {
      hide()
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerout', leave)
      document.removeEventListener('pointerdown', press)
      document.removeEventListener('pointerup', release)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('blur', hide)
      mouseAvailable.removeEventListener('change', hide)
    }
  }, [])

  return <div ref={cursor} className="firefly-cursor" aria-hidden="true" data-visible="false">
    <span className="firefly-aura" />
    <svg className="firefly-insect" viewBox="0 0 44 52" fill="none">
      <g className="firefly-wing-left"><ellipse cx="13" cy="23" rx="8" ry="4.5" transform="rotate(38 13 23)" fill="#fff7b5" fillOpacity=".75" stroke="#28271b" strokeWidth="1.2" /></g>
      <g className="firefly-wing-right"><ellipse cx="31" cy="23" rx="8" ry="4.5" transform="rotate(-38 31 23)" fill="#fff7b5" fillOpacity=".75" stroke="#28271b" strokeWidth="1.2" /></g>
      <path d="M19 10 15 4m10 6 4-6M18 22l-5 3m13-3 5 3M18 29l-4 5m12-5 4 5" stroke="#25241a" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="22" cy="29" rx="6.5" ry="11" fill="#ffe991" stroke="#25241a" strokeWidth="1.6" />
      <ellipse cx="22" cy="22" rx="6" ry="6.5" fill="#25241a" />
      <circle cx="22" cy="12" r="4.5" fill="#25241a" stroke="#fff7b5" strokeWidth=".65" />
      <ellipse cx="21" cy="33" rx="3.5" ry="4.5" fill="#fff9a4" />
    </svg>
  </div>
}
