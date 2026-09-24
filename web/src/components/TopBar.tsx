import { Link, useNavigate } from 'react-router-dom'
import { Database, FileText, Settings, Keyboard } from 'lucide-react'
import { GlassToolbar } from './glass'

/** 全局顶栏：Logo + 导航 + 状态 */
export default function TopBar({ right }: { right?: React.ReactNode }) {
  const nav = useNavigate()
  return (
    <GlassToolbar className="h-[56px] flex items-center justify-between px-5 flex-none">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[15px]">
          <span className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-cyan to-violet grid place-items-center text-[13px] font-bold text-[#06121a]">
            L
          </span>
          LocalRAG
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-[13px] text-sub">
          <Link to="/knowledge" className="px-3 py-1.5 rounded-lg hover:text-txt hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Database size={14} /> 知识库
          </Link>
          <Link to="/documents/doc-1" className="px-3 py-1.5 rounded-lg hover:text-txt hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <FileText size={14} /> 文档
          </Link>
          <Link to="/settings" className="px-3 py-1.5 rounded-lg hover:text-txt hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Settings size={14} /> 设置
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {right}
        <button
          onClick={() => nav('/shortcuts')}
          title="快捷键 Ctrl+/"
          className="text-sub hover:text-cyan transition-colors"
        >
          <Keyboard size={16} />
        </button>
      </div>
    </GlassToolbar>
  )
}
