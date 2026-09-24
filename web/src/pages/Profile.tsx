import { useState } from 'react'
import { User, SlidersHorizontal, Database, Info, Trash2, Download } from 'lucide-react'
import { GlassToolbar, GlassCard, GlassButton, GlassInput } from '../components/glass'
import { useStore } from '../store/useStore'
import type { RagSettings } from '../types'

const TABS = [
  { key: 'account', label: '账户', icon: User },
  { key: 'pref', label: '偏好', icon: SlidersHorizontal },
  { key: 'data', label: '数据', icon: Database },
  { key: 'about', label: '关于', icon: Info },
] as const

export default function Profile() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('account')
  const { settings, setSettings, clearHistory } = useStore()

  return (
    <div className="h-screen flex flex-col">
      <GlassToolbar className="h-[56px] flex items-center px-5 flex-none font-semibold">个人中心</GlassToolbar>
      <div className="flex-1 flex min-h-0">
        <aside className="w-[200px] flex-none border-r border-line/70 p-3" style={{ background: 'rgba(15,20,26,0.60)' }}>
          {TABS.map((t) => (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-[13.5px] mb-1 transition-colors ${
                tab === t.key ? 'bg-white/5 text-cyan' : 'text-sub hover:text-txt'
              }`}
            >
              <t.icon size={15} /> {t.label}
            </div>
          ))}
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[640px] space-y-4">
            {tab === 'account' && (
              <GlassCard className="p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan to-violet grid place-items-center text-[20px] font-bold text-[#06121a]">L</div>
                <div>
                  <div className="text-[15px] font-medium">本地用户</div>
                  <div className="text-[12.5px] text-sub mt-0.5">local@device · 管理员</div>
                  <div className="text-[11.5px] text-sub/70 mt-0.5">数据存储于本机 IndexedDB，不上传任何服务器</div>
                </div>
              </GlassCard>
            )}
            {tab === 'pref' && (
              <GlassCard className="p-6 space-y-4">
                <div className="text-[14px] font-medium">偏好设置</div>
                <Row label="主题">
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ theme: e.target.value as RagSettings['theme'] })}
                    className="glass-input px-3 py-1.5 text-[13px] outline-none bg-transparent"
                  >
                    <option value="dark" className="bg-panel">深色</option>
                    <option value="light" className="bg-panel">浅色（开发中）</option>
                  </select>
                </Row>
                <Row label="语言">
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ language: e.target.value as RagSettings['language'] })}
                    className="glass-input px-3 py-1.5 text-[13px] outline-none bg-transparent"
                  >
                    <option value="zh" className="bg-panel">中文</option>
                    <option value="en" className="bg-panel">English</option>
                  </select>
                </Row>
                <Row label="消息密度">
                  <select
                    value={settings.density}
                    onChange={(e) => setSettings({ density: e.target.value as RagSettings['density'] })}
                    className="glass-input px-3 py-1.5 text-[13px] outline-none bg-transparent"
                  >
                    <option value="default" className="bg-panel">默认</option>
                    <option value="compact" className="bg-panel">紧凑</option>
                  </select>
                </Row>
              </GlassCard>
            )}
            {tab === 'data' && (
              <GlassCard className="p-6 space-y-4">
                <div className="text-[14px] font-medium">数据管理</div>
                <Row label="导出全部会话" desc="下载为 JSON 文件">
                  <GlassButton
                    variant="glass"
                    onClick={() => {
                      const data = JSON.stringify(useStore.getState().conversations, null, 2)
                      const blob = new Blob([data], { type: 'application/json' })
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(blob)
                      a.download = 'localrag-sessions.json'
                      a.click()
                    }}
                  >
                    <Download size={13} className="inline mr-1" /> 导出
                  </GlassButton>
                </Row>
                <Row label="清空历史" desc="删除全部会话记录，不可恢复">
                  <GlassButton variant="danger" onClick={() => confirm('确认清空全部会话？') && clearHistory()}>
                    <Trash2 size={13} className="inline mr-1" /> 清空
                  </GlassButton>
                </Row>
                <Row label="删除账户" desc="本地演示环境，无真实账户">
                  <GlassButton variant="danger" disabled>删除</GlassButton>
                </Row>
              </GlassCard>
            )}
            {tab === 'about' && (
              <GlassCard className="p-6 text-[13px] text-sub leading-relaxed">
                LocalRAG v1.0.0 — 本地知识库 RAG 问答系统。完整介绍见
                <a href="#/about" className="text-cyan mx-1">关于页</a>。
              </GlassCard>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[13.5px]">{label}</div>
        {desc && <div className="text-[11.5px] text-sub mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  )
}
