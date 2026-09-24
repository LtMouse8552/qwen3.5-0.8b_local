import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, PanelLeftClose, PanelRightClose, ChevronDown, ArrowDown } from 'lucide-react'
import TopBar from '../components/TopBar'
import Composer from '../components/Composer'
import MessageItem, { renderMarkdown } from '../components/MessageItem'
import SourceCard from '../components/SourceCard'
import ShortcutsModal from '../components/ShortcutsModal'
import { GlassInput, GlassCard } from '../components/glass'
import { useStore, groupConversations } from '../store/useStore'
import { ollamaChatStream, type StreamHandle } from '../lib/ollama'
import type { ChatMessage, Citation } from '../types'
import { uid } from '../store/useStore'

const SUGGESTIONS = ['总结文档', '找出关键流程', '对比两个版本', '列出所有接口']

export default function Chat() {
  const nav = useNavigate()
  const {
    conversations, activeConvId, setActiveConv, newConversation,
    appendMessage, updateMessage, removeMessage, deleteConversation,
    kbs, activeKbId, setActiveKb, docs,
  } = useStore()

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'retrieving' | 'streaming'>('idle')
  const [liveText, setLiveText] = useState('')
  const [liveThinking, setLiveThinking] = useState('')
  const [activeCite, setActiveCite] = useState<number | null>(null)
  const [showJump, setShowJump] = useState(false)

  const streamRef = useRef<StreamHandle | null>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const conv = conversations.find((c) => c.id === activeConvId)
  const activeKb = kbs.find((k) => k.id === activeKbId)
  const kbDocs = docs.filter((d) => d.kbId === activeKbId)
  const lastAssistant = conv?.messages[conv.messages.length - 1]
  const liveCitations: Citation[] | undefined = lastAssistant?.citations

  const grouped = useMemo(() => {
    const filtered = conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    return groupConversations(filtered)
  }, [conversations, search])

  // 自动滚底
  useEffect(() => {
    const el = chatBoxRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [conv?.messages.length, liveText])

  const onScroll = () => {
    const el = chatBoxRef.current
    if (!el) return
    setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 300)
  }

  // Esc 停止
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && streaming) stop()
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); (document.getElementById('conv-search') as HTMLInputElement)?.focus() }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); doNew() }
      if (e.ctrlKey && e.key === 'b') setLeftOpen((v) => !v)
      if (e.ctrlKey && e.key === 'j') setRightOpen((v) => !v)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  function doNew() {
    newConversation(activeKbId)
  }

  function stop() {
    streamRef.current?.stop()
    streamRef.current = null
  }

  function send(text: string, useKb: boolean) {
    let convId = activeConvId
    if (!convId || !conv) convId = newConversation(activeKbId)

    const userMsg: ChatMessage = { id: 'm-' + uid(), role: 'user', content: text, createdAt: Date.now() }
    appendMessage(convId, userMsg)

    const aiId = 'm-' + uid()
    setStreaming(true)
    setPhase('streaming')
    setLiveText('')
    setLiveThinking('')

    // 组装历史上下文（含刚追加的用户消息）
    const history = (useStore.getState().conversations.find((c) => c.id === convId)?.messages ?? [])
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }))

    const { settings } = useStore.getState()

    streamRef.current = ollamaChatStream(
      {
        apiBase: settings.apiBase,
        model: settings.model,
        messages: history,
        temperature: settings.temperature,
        numPredict: settings.maxTokens,
        think: true,
      },
      (chunk) => setLiveText((t) => t + chunk),
      (tk) => setLiveThinking((t) => t + tk),
      () => {
        // 完成：将 liveText 固化为消息
        const finalText = liveTextRef.current
        const finalThinking = liveThinkingRef.current
        if (finalText || finalThinking) {
          appendMessage(convId, {
            id: aiId, role: 'assistant', content: finalText || '（模型未返回内容）',
            thinking: finalThinking || undefined, createdAt: Date.now(),
          })
        }
        setStreaming(false); setPhase('idle'); setLiveText(''); setLiveThinking('')
        streamRef.current = null
      },
      (err) => {
        appendMessage(convId, {
          id: aiId, role: 'assistant',
          content: `⚠️ 调用失败：${err} · 请确认 Ollama 已运行且设置了 OLLAMA_ORIGINS=*`,
          createdAt: Date.now(),
        })
      },
    )
  }

  // 借助 ref 在闭包中拿到最新值
  const liveTextRef = useRef('')
  liveTextRef.current = liveText
  const liveThinkingRef = useRef('')
  liveThinkingRef.current = liveThinking

  function regenerate() {
    if (!conv) return
    const msgs = conv.messages
    const lastAi = [...msgs].reverse().find((m) => m.role === 'assistant')
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user')
    if (!lastAi || !lastUser) return
    removeMessage(conv.id, lastAi.id)
    send(lastUser.content, true)
  }

  function jumpToCite(n: number) {
    setActiveCite(n)
    const el = document.getElementById(`source-card-${n}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* 模型离线横幅（演示条件：Ollama 不可达时才显示，这里默认隐藏） */}
      <TopBar
        right={
          <div className="hidden lg:flex items-center gap-3">
            {/* 知识库下拉 */}
            <select
              value={activeKbId}
              onChange={(e) => setActiveKb(e.target.value)}
              className="glass-input text-[12.5px] px-2.5 py-1.5 outline-none cursor-pointer appearance-none pr-7"
              style={{ backgroundImage: 'none' }}
            >
              {kbs.map((k) => <option key={k.id} value={k.id} className="bg-panel">{k.name}</option>)}
            </select>
            <div className="glass-input text-[12.5px] px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="w-[6px] h-[6px] rounded-full bg-ok pulse-glow" /> 模型在线
            </div>
            <button onClick={() => setLeftOpen(!leftOpen)} className="text-sub hover:text-cyan transition-colors" title="折叠左栏 Ctrl+B">
              <PanelLeftClose size={16} />
            </button>
            <button onClick={() => setRightOpen(!rightOpen)} className="text-sub hover:text-cyan transition-colors" title="折叠右栏 Ctrl+J">
              <PanelRightClose size={16} />
            </button>
          </div>
        }
      />

      {/* 生成中提示 */}
      {phase === 'retrieving' && (
        <div className="text-center text-[12px] text-cyan py-1.5 border-b border-line/50">
          正在检索知识库<span className="dot-jump inline-block">…</span>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* ===== 左栏：会话 ===== */}
        {leftOpen && (
          <aside className="w-[260px] flex-none border-r border-line/70 flex flex-col min-h-0 max-lg:absolute max-lg:z-40 max-lg:h-full max-lg:glass-modal" style={{ background: 'rgba(15,20,26,0.60)' }}>
            <div className="p-3 space-y-2">
              <button
                onClick={doNew}
                className="w-full flex items-center justify-center gap-1.5 bg-cyan text-[#06121a] text-[13px] font-medium rounded-[10px] py-2 hover:brightness-110 transition-all"
              >
                <Plus size={14} /> 新建问答
              </button>
              <GlassInput
                id="conv-search"
                placeholder="搜索会话 Ctrl+K"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {Object.entries(grouped).map(([g, list]) =>
                list.length > 0 && (
                  <div key={g} className="mb-3">
                    <div className="text-[11px] text-sub/70 px-2 mb-1">{g}</div>
                    {list.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setActiveConv(c.id)}
                        className={`relative group px-3 py-2 rounded-xl cursor-pointer text-[13px] mb-0.5 transition-colors ${
                          c.id === activeConvId ? 'bg-white/5 text-txt' : 'text-sub hover:text-txt hover:bg-white/[0.03]'
                        }`}
                      >
                        {c.id === activeConvId && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-cyan" />}
                        <div className="truncate flex items-center justify-between">
                          <span className="truncate">{c.title}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteConversation(c.id) }}
                            className="opacity-0 group-hover:opacity-100 text-sub hover:text-err text-[11px] transition-opacity"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          </aside>
        )}

        {/* ===== 中栏：对话 ===== */}
        <main className="flex-1 min-w-0 flex flex-col relative">
          <div ref={chatBoxRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-5 py-6">
            <div className="mx-auto space-y-6" style={{ maxWidth: 860 }}>
              {!conv || conv.messages.length === 0 ? (
                /* ---------- 空状态 ---------- */
                <div className="h-full flex flex-col items-center justify-center pt-24 fade-up">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-cyan/25 to-violet/25 grid place-items-center text-[30px] mb-5">📚</div>
                  <div className="text-[17px] font-medium mb-1.5">已连接知识库：{activeKb?.name}</div>
                  <div className="text-[12.5px] text-sub mb-8">共 {activeKb?.docCount} 篇文档 · {activeKb?.chunkCount} 个片段</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[560px]">
                    {SUGGESTIONS.map((s) => (
                      <GlassCard key={s} className="px-4 py-3.5 text-[13.5px] cursor-pointer" onClick={() => send(s, true)}>
                        <span className="text-cyan mr-1.5">→</span>{s}
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {conv.messages.map((m) => (
                    <MessageItem
                      key={m.id}
                      msg={m}
                      onRegenerate={m.role === 'assistant' ? regenerate : undefined}
                      onCiteClick={jumpToCite}
                    />
                  ))}
                  {/* 流式中的消息 */}
                  {streaming && (
                    <div>
                      <div className="md-body" style={{ maxWidth: 860 }}>
                        {liveThinking && (
                          <details className="mb-3 rounded-xl border border-line/60 px-3 py-2 text-[12.5px] text-sub" open>
                            <summary className="cursor-pointer select-none text-cyan">💭 思考过程</summary>
                            <div className="whitespace-pre-wrap mt-1.5">{liveThinking}</div>
                          </details>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(liveText) }} />
                        {phase === 'streaming' && <span className="cursor-blink text-cyan">▍</span>}
                      </div>
                      {phase === 'streaming' && (
                        <div className="flex gap-1 mt-2">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="dot-jump w-[5px] h-[5px] rounded-full bg-cyan" style={{ animationDelay: `${i * 160}ms` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 回到底部 */}
          {showJump && (
            <button
              onClick={() => chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' })}
              className="absolute bottom-[150px] left-1/2 -translate-x-1/2 glass-input px-3 py-1.5 text-[12px] text-sub hover:text-cyan flex items-center gap-1 z-10"
            >
              <ArrowDown size={13} /> 回到底部
            </button>
          )}

          {/* 输入区 */}
          <div className="px-5 pb-4 pt-2 flex-none border-t border-line/70">
            <div className="mx-auto" style={{ maxWidth: 860 }}>
              <Composer onSend={send} onStop={stop} streaming={streaming} />
            </div>
          </div>
        </main>

        {/* ===== 右栏：引用来源 ===== */}
        {rightOpen && (
          <aside className="w-[320px] flex-none border-l border-line/70 flex flex-col min-h-0 max-xl:hidden" style={{ background: 'rgba(15,20,26,0.60)' }}>
            <div className="px-4 py-3 border-b border-line/50 flex items-center justify-between flex-none">
              <span className="text-[13.5px] font-medium">引用来源</span>
              <ChevronDown size={15} className="text-sub" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {liveCitations && liveCitations.length > 0 ? (
                liveCitations.map((c) => (
                  <SourceCard
                    key={c.id}
                    cite={c}
                    active={activeCite === c.id}
                    onClick={() => nav(`/documents/${c.docId}`)}
                  />
                ))
              ) : (
                <div className="text-center text-[12.5px] text-sub py-16">本次回答未使用知识库</div>
              )}
            </div>
          </aside>
        )}
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}
