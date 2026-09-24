import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Citation } from '../types'

function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>
  const idx = text.indexOf(keyword)
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-cyan">{keyword}</span>
      {text.slice(idx + keyword.length)}
    </>
  )
}

export default function SourceCard({
  cite, active, onClick,
}: {
  cite: Citation
  active: boolean
  onClick: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      id={`source-card-${cite.id}`}
      onClick={onClick}
      className={`glass-source p-3 cursor-pointer transition-all duration-200 ${active ? 'active' : 'hover:border-white/15'}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md border border-cyan/50 text-cyan">
          [{cite.id}]
        </span>
        <span className="text-[13px] font-medium truncate flex-1">{cite.docName}</span>
      </div>
      <div className="text-[11.5px] text-sub mb-2">
        第 {cite.page} 页 · {cite.section}
      </div>
      {/* 相似度 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-[4px] rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan transition-all duration-500"
            style={{ width: `${cite.similarity}%` }}
          />
        </div>
        <span className="text-[11px] text-cyan font-mono">{cite.similarity}%</span>
      </div>
      {/* 原文片段，最多 5 行 */}
      <p
        className={`text-[12.5px] text-sub leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}
        style={{ display: '-webkit-box', WebkitLineClamp: expanded ? undefined : 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        <HighlightText text={cite.snippet} keyword={cite.keyword} />
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
        className="text-[11px] text-sub hover:text-cyan mt-1.5 flex items-center gap-0.5 transition-colors"
      >
        {expanded ? <><ChevronUp size={11} /> 收起</> : <><ChevronDown size={11} /> 展开全文</>}
      </button>
    </div>
  )
}
