import type { ReactNode, ButtonHTMLAttributes } from 'react'
import LiquidHighlight from './LiquidHighlight'

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-panel ${className}`}>{children}</div>
}

export function GlassCard({ children, className = '', hoverable = true, onClick }: { children: ReactNode; className?: string; hoverable?: boolean; onClick?: () => void }) {
  return (
    <LiquidHighlight onClick={onClick} className={`glass-card ${hoverable ? 'hover:border-white/20 transition-colors duration-200' : ''} ${className}`}>
      {children}
    </LiquidHighlight>
  )
}

export function GlassToolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-toolbar ${className}`}>{children}</div>
}

export function GlassModal({
  open, onClose, title, children, width = 560,
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div
        className="glass-modal w-full max-h-[82vh] overflow-y-auto p-6 fade-up"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sub hover:text-txt text-xl leading-none px-1">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      {...rest}
      className={`glass-input px-3 py-2 text-[13.5px] text-txt placeholder:text-sub/60 outline-none focus:border-cyan/50 transition-colors ${className}`}
    />
  )
}

/** 主按钮：青色实色填充 + 深色文字；variant=glass 为次按钮 */
export function GlassButton({
  children, variant = 'primary', className = '', ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'glass' | 'danger' }) {
  const base = 'px-4 py-2 rounded-[10px] text-[13.5px] font-medium transition-all duration-200 disabled:opacity-40'
  const styles = {
    primary: 'bg-cyan text-[#06121a] hover:brightness-110',
    glass: 'glass-input hover:border-cyan/50 hover:text-cyan text-sub',
    danger: 'border border-err/60 text-err hover:bg-err hover:text-white',
  }
  return (
    <button {...rest} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}
