import { useState } from 'react'
import { Cpu, Search, Palette, Database, Zap } from 'lucide-react'
import { GlassToolbar, GlassCard, GlassButton, GlassInput } from '../components/glass'
import { useStore } from '../store/useStore'
import type { RagSettings } from '../types'

const TABS = [
  { key: 'model', label: '模型', icon: Cpu },
  { key: 'retrieval', label: '检索', icon: Search },
  { key: 'ui', label: '界面', icon: Palette },
  { key: 'data', label: '数据', icon: Database },
] as const

export default function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('model')
  const { settings, setSettings, clearHistory } = useStore()
  const [testResult, setTestResult] = useState<string | null>(null)

  const testConnection = async () => {
    setTestResult('测试中…')
    try {
      const r = await fetch(`${settings.apiBase}/api/tags`, { signal: AbortSignal.timeout(3000) })
      setTestResult(r.ok ? '✓ 连接成功' : `✗ HTTP ${r.status}`)
    } catch {
      setTestResult('✗ 无法连接（演示环境属正常）')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <GlassToolbar className="h-[56px] flex items-center px-5 flex-none font-semibold">设置</GlassToolbar>
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
            {tab === 'model' && (
              <GlassCard className="p-6 space-y-5">
                <SectionTitle icon={Cpu} title="模型配置" />
                <Row label="模型">
                  <select
                    value={settings.model}
                    onChange={(e) => setSettings({ model: e.target.value })}
                    className="glass-input px-3 py-1.5 text-[13px] outline-none"
                  >
                    <option className="bg-panel">Qwen2.5 7B</option>
                    <option className="bg-panel">Qwen3.5 0.8B</option>
                    <option className="bg-panel">Llama 3 8B</option>
                  </select>
                </Row>
                <Row label="API 地址">
                  <GlassInput
                    value={settings.apiBase}
                    onChange={(e) => setSettings({ apiBase: e.target.value })}
                    className="w-[240px] font-mono !text-[12.5px]"
                  />
                </Row>
                <SliderRow label="temperature" value={settings.temperature} min={0} max={2} step={0.1}
                  onChange={(v) => setSettings({ temperature: v })} />
                <SliderRow label="top_p" value={settings.topP} min={0} max={1} step={0.05}
                  onChange={(v) => setSettings({ topP: v })} />
                <Row label="max_tokens">
                  <GlassInput type="number" value={settings.maxTokens}
                    onChange={(e) => setSettings({ maxTokens: Number(e.target.value) })}
                    className="w-[100px]" />
                </Row>
                <div className="flex items-center gap-3">
                  <GlassButton variant="glass" onClick={testConnection}>连接测试</GlassButton>
                  {testResult && <span className="text-[12.5px] text-sub">{testResult}</span>}
                </div>
              </GlassCard>
            )}
            {tab === 'retrieval' && (
              <GlassCard className="p-6 space-y-5">
                <SectionTitle icon={Search} title="检索配置" />
                <SliderRow label="Top-K" value={settings.topK} min={1} max={10} step={1}
                  onChange={(v) => setSettings({ topK: v })} />
                <SliderRow label="相似度阈值 %" value={settings.threshold} min={0} max={100} step={5}
                  onChange={(v) => setSettings({ threshold: v })} />
                <Row label="重排模型" desc="对召回片段二次排序，提升引用质量">
                  <Switch checked={settings.rerank} onChange={(v) => setSettings({ rerank: v })} />
                </Row>
                <Row label="切片大小">
                  <GlassInput type="number" value={settings.chunkSize}
                    onChange={(e) => setSettings({ chunkSize: Number(e.target.value) })}
                    className="w-[100px]" />
                </Row>
              </GlassCard>
            )}
            {tab === 'ui' && (
              <GlassCard className="p-6 space-y-5">
                <SectionTitle icon={Palette} title="界面" />
                <Row label="主题">
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ theme: e.target.value as RagSettings['theme'] })}
                    className="glass-input px-3 py-1.5 text-[13px] outline-none"
                  >
                    <option value="dark" className="bg-panel">深色</option>
                    <option value="light" className="bg-panel">浅色（开发中）</option>
                  </select>
                </Row>
                <SliderRow label="正文字号" value={settings.fontSize} min={13} max={18} step={1}
                  onChange={(v) => setSettings({ fontSize: v })} />
                <Row label="消息密度">
                  <select
                    value={settings.density}
                    onChange={(e) => setSettings({ density: e.target.value as RagSettings['density'] })}
                    className="glass-input px-3 py-1.5 text-[13px] outline-none"
                  >
                    <option value="default" className="bg-panel">默认</option>
                    <option value="compact" className="bg-panel">紧凑</option>
                  </select>
                </Row>
              </GlassCard>
            )}
            {tab === 'data' && (
              <GlassCard className="p-6 space-y-5">
                <SectionTitle icon={Database} title="数据" />
                <Row label="导出会话" desc="JSON 格式下载">
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
                  >导出</GlassButton>
                </Row>
                <Row label="清空历史" desc="删除全部会话记录，不可恢复">
                  <GlassButton variant="danger" onClick={() => confirm('确认清空全部会话？') && clearHistory()}>清空</GlassButton>
                </Row>
                <Row label="删除知识库" desc="前往知识库页面单独管理">
                  <GlassButton variant="danger" onClick={() => location.hash = '#/knowledge'}>前往</GlassButton>
                </Row>
              </GlassCard>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[14px] font-medium -mb-1">
      <Icon size={15} className="text-cyan" /> {title}
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

function SliderRow({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-[13.5px] mb-1.5">
        <span>{label}</span>
        <span className="text-cyan font-mono text-[12.5px]">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan"
        style={{ accentColor: '#22D3EE' }}
      />
    </div>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-[38px] h-[22px] rounded-full relative transition-colors duration-200 ${checked ? 'bg-cyan' : 'bg-line'}`}
    >
      <span
        className="absolute top-[3px] w-[16px] h-[16px] rounded-full bg-white transition-all duration-200"
        style={{ left: checked ? 19 : 3 }}
      />
    </button>
  )
}
