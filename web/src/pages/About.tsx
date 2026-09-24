import { useState } from 'react'
import { ChevronDown, BookOpen, Bug, RefreshCw } from 'lucide-react'
import { GlassToolbar, GlassCard, GlassButton } from '../components/glass'
import VersionBadge from '../components/VersionBadge'

const FAQS = [
  { q: '我的数据会上传到服务器吗？', a: '不会。所有文档、索引与会话均存储在本机（IndexedDB / 本地文件），模型推理也在本地完成，全程离线。' },
  { q: '支持哪些文档格式？', a: 'PDF、Word（docx）、Markdown、TXT、Excel。上传后自动切片并向量化建立索引。' },
  { q: '回答中的 [1] [2] 是什么？', a: '引用角标，指向右侧"引用来源"面板中的原文片段。点击角标可高亮对应来源，点击来源卡片可打开文档定位原文。' },
  { q: '模型可以更换吗？', a: '可以。在设置 → 模型中切换本地模型，或修改 API 地址接入任意兼容 OpenAI 接口的本地推理服务。' },
  { q: '索引失败怎么办？', a: '在知识库页面对失败文档点击"重试"；仍失败可查看原因，常见为扫描版 PDF 缺少文本层或文件损坏。' },
]

export default function About() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="h-screen flex flex-col">
      <GlassToolbar className="h-[56px] flex items-center px-5 flex-none font-semibold">关于 / 帮助</GlassToolbar>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[640px] mx-auto space-y-4 pb-10">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan to-violet grid place-items-center text-[18px] font-bold text-[#06121a]">L</span>
              <div>
                <div className="text-[16px] font-semibold flex items-center gap-2">LocalRAG <VersionBadge /></div>
                <div className="text-[12.5px] text-sub mt-0.5">本地知识库 RAG 问答系统</div>
              </div>
            </div>
            <p className="text-[13px] text-sub leading-relaxed">
              上传本地文档，让本地大模型基于资料回答问题，并显示引用来源。数据不出设备，全程离线运行。
            </p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'IndexedDB'].map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-md border border-line text-sub">{t}</span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-[14px] font-medium mb-3">隐私说明</div>
            <p className="text-[13px] text-sub leading-relaxed">
              本应用不包含任何遥测、统计或云端同步代码。文档、向量索引、会话记录仅保存在浏览器本地存储中，
              清空浏览器数据将永久删除这些内容，请先在「个人中心 → 数据」中导出备份。
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-[14px] font-medium mb-3">常见问题</div>
            <div className="divide-y divide-line/60">
              {FAQS.map((f, i) => (
                <div key={i} className="py-3">
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between text-[13.5px] text-left"
                  >
                    {f.q}
                    <ChevronDown size={15} className={`text-sub transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
                  </button>
                  {open === i && <p className="text-[12.5px] text-sub leading-relaxed mt-2">{f.a}</p>}
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex gap-3">
            <GlassButton variant="glass"><BookOpen size={14} className="inline mr-1" /> 查看文档</GlassButton>
            <GlassButton variant="glass"><Bug size={14} className="inline mr-1" /> 反馈问题</GlassButton>
            <GlassButton variant="glass"><RefreshCw size={14} className="inline mr-1" /> 检查更新</GlassButton>
          </div>
        </div>
      </main>
    </div>
  )
}
