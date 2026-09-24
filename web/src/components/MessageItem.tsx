import { useState } from 'react'
import { Copy, RefreshCw, Pencil, Quote } from 'lucide-react'
import type { ChatMessage } from '../types'

/** 轻量 Markdown 渲染（标题/列表/加粗/行内代码/代码块/表格/引用/引用角标） */
export function renderMarkdown(src: string, onCite?: (n: number) => void): string {
  let s = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // 代码块
  s = s.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
    `<pre data-lang="${lang}"><code>${code}</code></pre>`)
  // 行内代码
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  // 标题
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>')
  // 加粗 / 斜体
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  // 引用块
  s = s.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
  // 表格
  s = s.replace(/^(\|.+\|)\n(\|[-| ]+\|)\n((?:\|.*\|\n?)*)/gm, (_m, head, _sep, rows) => {
    const th = (head as string).split('|').filter(Boolean).map((t: string) => `<th>${t.trim()}</th>`).join('')
    const trs = (rows as string).trim().split('\n').map((r: string) => {
      const td = r.split('|').filter(Boolean).map((t: string) => `<td>${t.trim()}</td>`).join('')
      return `<tr>${td}</tr>`
    }).join('')
    return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
  })
  // 无序 / 有序列表（连续行）
  s = s.replace(/((?:^[-*] .+\n?)+)/gm, (m) => {
    const items = m.trim().split('\n').map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')
    return `<ul>${items}</ul>`
  })
  s = s.replace(/((?:^\d+\. .+\n?)+)/gm, (m) => {
    const items = m.trim().split('\n').map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('')
    return `<ol>${items}</ol>`
  })
  // 段落换行
  s = s.replace(/\n(?!<)/g, '<br/>')
  // 引用角标 [1] → 可点击青色标签
  s = s.replace(/\[(\d)\]/g, (_m, n) =>
    `<span class="cite-badge" data-cite="${n}">[${n}]</span>`)
  return s
}

export default function MessageItem({
  msg, onRegenerate, onCiteClick,
}: {
  msg: ChatMessage
  onRegenerate?: () => void
  onCiteClick?: (n: number) => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="rounded-[14px] px-4 py-2.5 max-w-[70%] text-[14.5px] leading-relaxed whitespace-pre-wrap"
          style={{ background: '#1E293B' }}
        >
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <div className="md-body" style={{ maxWidth: 860 }}>
        <div
          className="md-render"
          onClick={(e) => {
            const t = (e.target as HTMLElement).closest('.cite-badge')
            if (t && onCiteClick) onCiteClick(Number((t as HTMLElement).dataset.cite))
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
        {msg.aborted && <div className="text-[12px] text-warn mt-1">⏹ 已停止生成</div>}
      </div>
      {/* 悬停操作条 */}
      {!msg.aborted && (
        <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <IconBtn onClick={copy} label={copied ? '已复制' : '复制'}><Copy size={13} /></IconBtn>
          {onRegenerate && <IconBtn onClick={onRegenerate} label="重新生成"><RefreshCw size={13} /></IconBtn>}
          <IconBtn label="编辑"><Pencil size={13} /></IconBtn>
          {msg.citations && msg.citations.length > 0 && (
            <IconBtn label="引用"><Quote size={13} /></IconBtn>
          )}
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-[11.5px] text-sub hover:text-cyan px-1.5 py-0.5 rounded transition-colors"
    >
      {children} {label}
    </button>
  )
}
