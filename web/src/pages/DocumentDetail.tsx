import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react'
import { GlassToolbar, GlassButton } from '../components/glass'
import { useStore } from '../store/useStore'

export default function DocumentDetail() {
  const { id } = useParams()
  const doc = useStore((s) => s.docs.find((d) => d.id === id))
  const kb = useStore((s) => s.kbs.find((k) => k.id === doc?.kbId))

  if (!doc) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-sub">文档不存在</div>
        <Link to="/knowledge"><GlassButton variant="glass">返回知识库</GlassButton></Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <GlassToolbar className="h-[56px] flex items-center gap-4 px-5 flex-none">
        <Link to="/knowledge" className="text-sub hover:text-cyan transition-colors"><ArrowLeft size={18} /></Link>
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={16} className="text-cyan flex-none" />
          <span className="text-[14px] font-medium truncate">{doc.name}</span>
        </div>
        <span className="text-[12px] text-sub">{doc.pages} 页 · {doc.chunks} 片段</span>
        {doc.status === 'indexed' && <span className="text-[11.5px] px-2 py-0.5 rounded-md bg-ok/15 text-ok">已索引</span>}
        <div className="ml-auto">
          <Link to="/chat"><GlassButton variant="glass" className="!py-1.5 !px-3 text-[12.5px]">在问答中打开 <ExternalLink size={12} className="inline ml-1" /></GlassButton></Link>
        </div>
      </GlassToolbar>

      <div className="flex-1 flex min-h-0">
        {/* 左：预览（模拟 PDF 页面 + 命中高亮） */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          <div className="mx-auto max-w-[760px] glass-panel p-8 leading-loose text-[14px]" style={{ minHeight: 500 }}>
            <div className="text-center text-sub text-[12px] mb-6">— 第 1 页 · 预览 —</div>
            <h2 className="text-[18px] font-semibold mb-4">{doc.name.replace(/\.\w+$/, '')}</h2>
            <p className="text-sub mb-3">
              本节为文档预览演示。实际使用中由 PDF.js 渲染原文页面，并对检索命中的段落进行青色高亮标注。
            </p>
            <p className="mb-3">
              用户可以通过手机号或邮箱进行
              <mark className="text-[#06121a] rounded px-1" style={{ background: 'rgba(34,211,238,0.85)' }}>登录</mark>
              ，登录成功后系统将颁发有效期 7 天的会话
              <mark className="text-[#06121a] rounded px-1" style={{ background: 'rgba(34,211,238,0.85)' }}>令牌</mark>
              。连续失败 5 次将触发账号保护策略，需通过
              <mark className="text-[#06121a] rounded px-1" style={{ background: 'rgba(34,211,238,0.85)' }}>验证码</mark>
              解锁。
            </p>
            <p className="text-sub mb-3">
              其余正文段落按原文渲染。命中关键词由检索阶段的相似度匹配决定，点击右栏相关片段可滚动定位到此处的对应段落。
            </p>
            <p className="text-sub">…（演示文档内容）…</p>
          </div>
        </main>

        {/* 右：文档信息 + 相关片段 */}
        <aside className="w-[320px] flex-none border-l border-line/70 overflow-y-auto p-4" style={{ background: 'rgba(15,20,26,0.60)' }}>
          <div className="glass-panel p-4 mb-4">
            <div className="text-[13px] font-medium mb-3">文档信息</div>
            <dl className="space-y-2 text-[12.5px]">
              <div className="flex justify-between"><dt className="text-sub">所属知识库</dt><dd>{kb?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-sub">文件大小</dt><dd>{doc.size}</dd></div>
              <div className="flex justify-between"><dt className="text-sub">切片数量</dt><dd>{doc.chunks}</dd></div>
              <div className="flex justify-between"><dt className="text-sub">更新时间</dt><dd>{doc.updatedAt}</dd></div>
            </dl>
          </div>
          <div className="text-[13px] font-medium mb-2">相关片段</div>
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-source p-3 cursor-pointer hover:border-cyan/40 transition-colors">
                <div className="text-[12px] text-cyan mb-1">片段 #{i} · 第 {i} 段</div>
                <p className="text-[12.5px] text-sub leading-relaxed line-clamp-3">
                  这是与当前文档相关的检索片段演示内容，实际系统中显示向量检索返回的原文片段与相似度。
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
