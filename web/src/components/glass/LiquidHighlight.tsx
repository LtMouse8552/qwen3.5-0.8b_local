import { useRef, type ReactNode, type MouseEvent } from 'react'

/** 玻璃卡片 + 鼠标跟随青色高光（遵循 prefers-reduced-motion 自动禁用） */
export default function LiquidHighlight({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', `${e.clientX - r.left}px`)
    el.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={onMove} onClick={onClick} className={`liquid-highlight ${className}`}>
      {children}
    </div>
  )
}
