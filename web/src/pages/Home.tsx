import { Link } from 'react-router-dom'
import { Cpu, FileSearch, Quote, WifiOff, ArrowRight, Play } from 'lucide-react'
import { GlassToolbar, GlassCard, GlassButton } from '../components/glass'
import LiquidHighlight from '../components/glass/LiquidHighlight'

const FEATURES = [
  { icon: Cpu, title: '本地模型', desc: 'Qwen2.5 7B 运行在本机，推理不出设备' },
  { icon: FileSearch, title: '文档问答', desc: '上传 PDF / Word / Markdown，基于资料回答' },
  { icon: Quote, title: '引用溯源', desc: '每个回答附带编号引用，可定位原文' },
  { icon: WifiOff, title: '完全离线', desc: '无网络依赖，数据永不上传' },
]

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(1000px 500px at 50% -100px, rgba(34,211,238,0.10), transparent 60%), #0B0F14' }}
    >
      <GlassToolbar className="h-[56px] flex items-center justify-between px-6 flex-none">
        <div className="flex items-center gap-2 font-semibold text-[15px]">
          <span className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-cyan to-violet grid place-items-center text-[13px] font-bold text-[#06121a]">L</span>
          LocalRAG
        </div>
        <nav className="hidden md:flex gap-1 text-[13px] text-sub">
          <Link to="/knowledge" className="px-3 py-1.5 rounded-lg hover:text-txt hover:bg-white/5 transition-colors">知识库</Link>
          <Link to="/documents/doc-1" className="px-3 py-1.5 rounded-lg hover:text-txt hover:bg-white/5 transition-colors">文档</Link>
          <Link to="/settings" className="px-3 py-1.5 rounded-lg hover:text-txt hover:bg-white/5 transition-colors">设置</Link>
        </nav>
        <Link to="/chat">
          <GlassButton>进入工作台</GlassButton>
        </Link>
      </GlassToolbar>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-8">
        <div className="text-center fade-up">
          <h1 className="text-[40px] md:text-[48px] font-semibold tracking-wide leading-tight">
            本地知识库 · <span className="text-cyan">私有 AI 问答</span>
          </h1>
          <p className="text-sub text-[15px] mt-4 max-w-[560px] mx-auto leading-relaxed">
            上传你的文档，让本地模型基于资料回答，数据不出设备，全程离线运行。
          </p>
        </div>

        <div className="flex gap-3 fade-up" style={{ animationDelay: '150ms' }}>
          <Link to="/chat">
            <GlassButton className="!px-6 !py-2.5 text-[14px]">
              开始使用 <ArrowRight size={15} className="inline ml-1" />
            </GlassButton>
          </Link>
          <Link to="/chat">
            <GlassButton variant="glass" className="!px-6 !py-2.5 text-[14px]">
              <Play size={14} className="inline mr-1" /> 查看演示
            </GlassButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[980px] mt-6">
          {FEATURES.map((f, i) => (
            <GlassCard key={f.title} className="p-5 fade-up" >
              <div style={{ animationDelay: `${250 + i * 100}ms` }}>
                <f.icon size={22} className="text-cyan mb-3" />
                <div className="font-medium text-[14.5px] mb-1">{f.title}</div>
                <div className="text-[12.5px] text-sub leading-relaxed">{f.desc}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="text-center text-[12px] text-sub py-5 border-t border-line/60">
        支持格式 PDF · Word · Markdown · TXT · Excel
      </div>
    </div>
  )
}
