import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, FileText, Plus, MessageSquare, RotateCw, AlertCircle } from 'lucide-react'
import { GlassToolbar, GlassButton, GlassInput, GlassModal } from '../components/glass'
import LiquidHighlight from '../components/glass/LiquidHighlight'
import { useStore } from '../store/useStore'
import type { KbDoc, DocStatus } from '../types'
import { uid } from '../store/useStore'

function StatusTag({ doc }: { doc: KbDoc }) {
  if (doc.status === 'indexed')
    return <span className="text-[11.5px] px-2 py-0.5 rounded-md bg-ok/15 text-ok">已索引</span>
  if (doc.status === 'parsing')
    return (
      <span className="text-[11.5px] px-2 py-0.5 rounded-md bg-warn/15 text-warn flex items-center gap-2">
        解析中 {doc.progress}%
        <span className="inline-block w-16 h-[3px] rounded bg-warn/25 overflow-hidden">
          <span className="block h-full bg-warn" style={{ width: `${doc.progress}%` }} />
        </span>
      </span>
    )
  return (
    <span className="text-[11.5px] px-2 py-0.5 rounded-md bg-err/15 text-err flex items-center gap-2">
      <AlertCircle size={11} /> 失败
      <button
        onClick={() => useStore.getState().updateDoc(doc.id, { status: 'parsing', progress: 0 })}
        className="underline hover:text-white"
      >
        重试
      </button>
    </span>
  )
}

export default function Knowledge() {
  const nav = useNavigate()
  const { kbs, docs, activeKbId, setActiveKb, addDoc, addKb } = useStore()
  const [drag, setDrag] = useState(false)
  const [newKbOpen, setNewKbOpen] = useState(false)
  const [newKbName, setNewKbName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const activeKb = kbs.find((k) => k.id === activeKbId)
  const kbDocs = docs.filter((d) => d.kbId === activeKbId)

  // 模拟上传 → 解析进度 → 已索引
  const simulateUpload = (name: string) => {
    const id = 'doc-' + uid()
    const doc: KbDoc = {
      id, kbId: activeKbId, name, size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
      pages: Math.floor(Math.random() * 30 + 3), status: 'parsing', progress: 0,
      updatedAt: new Date().toISOString().slice(0, 10), chunks: 0,
    }
    addDoc(doc)
    const timer = setInterval(() => {
      const cur = useStore.getState().docs.find((d) => d.id === id)
      if (!cur) { clearInterval(timer); return }
      const next = cur.progress + 12 + Math.random() * 15
      if (next >= 100) {
        clearInterval(timer)
        useStore.getState().updateDoc(id, { status: 'indexed' as DocStatus, progress: 100, chunks: Math.floor(Math.random() * 80 + 20) })
      } else {
        useStore.getState().updateDoc(id, { progress: Math.floor(next) })
      }
    }, 260)
  }

  return (
    <div className="h-screen flex flex-col">
      <GlassToolbar className="h-[56px] flex items-center justify-between px-5 flex-none">
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-cyan to-violet grid place-items-center text-[13px] font-bold text-[#06121a]">L</span>
          LocalRAG
        </div>
        <div className="flex gap-3">
          <Link to="/chat" className="text-[13px] text-sub hover:text-cyan transition-colors px-3 py-1.5">问答</Link>
          <Link to="/settings" className="text-[13px] text-sub hover:text-cyan transition-colors px-3 py-1.5">设置</Link>
          <GlassButton onClick={() => setNewKbOpen(true)}>
            <Plus size={14} className="inline mr-1" /> 新建知识库
          </GlassButton>
        </div>
      </GlassToolbar>

      <div className="flex-1 flex min-h-0">
        {/* 左栏：知识库列表 */}
        <aside className="w-[260px] flex-none border-r border-line/70 overflow-y-auto p-3" style={{ background: 'rgba(15,20,26,0.60)' }}>
          {kbs.map((kb) => (
            <div
              key={kb.id}
              onClick={() => setActiveKb(kb.id)}
              className={`relative px-3 py-2.5 rounded-xl cursor-pointer text-[13.5px] mb-1 transition-colors ${
                kb.id === activeKbId ? 'bg-white/5 text-txt' : 'text-sub hover:text-txt hover:bg-white/[0.03]'
              }`}
            >
              {kb.id === activeKbId && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-full bg-cyan" />}
              <div className="truncate">{kb.name}</div>
              <div className="text-[11px] text-sub/70 mt-0.5">{kb.docCount} 篇文档 · {kb.chunkCount} 片段</div>
            </div>
          ))}
        </aside>

        {/* 中栏 */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          <h1 className="text-[18px] font-semibold mb-1">{activeKb?.name ?? '知识库'}</h1>
          <p className="text-[13px] text-sub mb-5">{activeKb?.description}</p>

          {/* 上传区 */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault(); setDrag(false)
              Array.from(e.dataTransfer.files).forEach((f) => simulateUpload(f.name))
            }}
            onClick={() => fileRef.current?.click()}
            className={`glass-panel border-dashed cursor-pointer text-center py-10 mb-6 transition-colors duration-200 ${
              drag ? 'border-cyan' : ''
            }`}
            style={{ borderWidth: 1.5, borderRadius: 16 }}
          >
            <Upload size={26} className={`mx-auto mb-2 ${drag ? 'text-cyan' : 'text-sub'}`} />
            <div className="text-[13.5px]">{drag ? '松开即可上传' : '拖拽文件到此处，或点击上传'}</div>
            <div className="text-[11.5px] text-sub/70 mt-1">支持 PDF · Word · Markdown · TXT · Excel</div>
            <input
              ref={fileRef} type="file" multiple className="hidden"
              onChange={(e) => Array.from(e.target.files ?? []).forEach((f) => simulateUpload(f.name))}
            />
          </div>

          {/* 文档列表 */}
          <div className="space-y-2 mb-6">
            {kbDocs.map((doc) => (
              <LiquidHighlight key={doc.id} className="glass-card flex items-center gap-3 px-4 py-3">
                <FileText size={17} className="text-cyan flex-none" />
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => nav(`/documents/${doc.id}`)}>
                  <div className="text-[13.5px] truncate">{doc.name}</div>
                  <div className="text-[11.5px] text-sub">{doc.size} · {doc.pages} 页 · {doc.chunks} 片段 · {doc.updatedAt}</div>
                </div>
                <StatusTag doc={doc} />
              </LiquidHighlight>
            ))}
            {kbDocs.length === 0 && (
              <div className="text-center py-14 text-sub text-[13px]">
                知识库为空，上传第一篇文档开始使用
              </div>
            )}
          </div>

          <Link to="/chat">
            <GlassButton className="w-full !py-2.5">
              <MessageSquare size={15} className="inline mr-1.5" /> 进入问答
            </GlassButton>
          </Link>
        </main>
      </div>

      {/* 新建知识库弹窗 */}
      <GlassModal open={newKbOpen} onClose={() => setNewKbOpen(false)} title="新建知识库">
        <div className="space-y-4">
          <div>
            <div className="text-[12.5px] text-sub mb-1.5">名称</div>
            <GlassInput
              value={newKbName} onChange={(e) => setNewKbName(e.target.value)}
              placeholder="例如：法律合同库" className="w-full"
            />
          </div>
          <GlassButton
            className="w-full"
            disabled={!newKbName.trim()}
            onClick={() => {
              addKb({ id: 'kb-' + uid(), name: newKbName.trim(), description: '新建知识库', docCount: 0, chunkCount: 0, createdAt: new Date().toISOString().slice(0, 10) })
              setNewKbName(''); setNewKbOpen(false)
            }}
          >
            创建
          </GlassButton>
        </div>
      </GlassModal>
    </div>
  )
}
