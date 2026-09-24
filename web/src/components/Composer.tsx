import { useRef, useState } from 'react'
import { Paperclip, ArrowUp, Square, Library } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Composer({
  onSend, onStop, streaming,
}: {
  onSend: (text: string, useKb: boolean) => void
  onStop: () => void
  streaming: boolean
}) {
  const [text, setText] = useState('')
  const [useKb, setUseKb] = useState(true)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const activeKb = useStore((s) => s.kbs.find((k) => k.id === s.activeKbId))

  const submit = () => {
    const t = text.trim()
    if (!t || streaming) return
    onSend(t, useKb)
    setText('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="glass-panel p-3" style={{ borderRadius: 16 }}>
      {/* 上下文超限提示条 */}
      {text.length > 6000 && (
        <div className="mb-2 px-3 py-1.5 rounded-lg text-[12px] text-warn" style={{ background: 'rgba(245,158,11,0.12)' }}>
          上下文超限，将截断较早的会话内容
        </div>
      )}
      <div className="flex items-end gap-2">
        <button className="text-sub hover:text-cyan p-2 transition-colors" title="附件（演示）">
          <Paperclip size={17} />
        </button>
        <button
          onClick={() => setUseKb(!useKb)}
          className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg transition-colors ${
            useKb ? 'text-cyan bg-cyan/10' : 'text-sub hover:text-txt'
          }`}
          title="开关知识库检索"
        >
          <Library size={14} />
          {useKb && activeKb ? activeKb.name : '知识库'}
        </button>
        <textarea
          ref={taRef}
          value={text}
          rows={1}
          placeholder="基于知识库提问…"
          onChange={(e) => {
            setText(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
          }}
          className="flex-1 bg-transparent outline-none resize-none text-[14.5px] leading-relaxed placeholder:text-sub/50 min-h-[32px] py-1"
        />
        {streaming ? (
          <button
            onClick={onStop}
            className="w-9 h-9 rounded-[10px] grid place-items-center text-white transition-colors"
            style={{ background: '#EF4444' }}
            title="停止生成 (Esc)"
          >
            <Square size={13} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-[10px] grid place-items-center bg-cyan text-[#06121a] disabled:opacity-35 transition-opacity"
            title="发送 (Enter)"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className="text-[11.5px] text-sub/70 mt-1.5 px-1">Enter 发送 · Shift+Enter 换行 · 内容由本地模型生成</div>
    </div>
  )
}
