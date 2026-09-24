import { Link } from 'react-router-dom'
import { GlassToolbar } from '../components/glass'
import Kbd from '../components/Kbd'

const GROUPS: { title: string; items: [string[], string][] }[] = [
  {
    title: '全局',
    items: [
      [['Ctrl', 'K'], '搜索会话'],
      [['Ctrl', 'N'], '新建问答'],
      [['Ctrl', '/'], '打开快捷键帮助'],
    ],
  },
  {
    title: '对话',
    items: [
      [['Enter'], '发送'],
      [['Shift', 'Enter'], '换行'],
      [['Esc'], '停止生成'],
      [['Ctrl', 'R'], '重新生成'],
    ],
  },
  {
    title: '引用',
    items: [
      [['Alt', '1~9'], '跳转到第 N 个引用'],
      [['Alt', '←'], '返回上一个引用'],
    ],
  },
  {
    title: '界面',
    items: [
      [['Ctrl', 'B'], '折叠左栏'],
      [['Ctrl', 'J'], '折叠右栏'],
      [['Ctrl', 'Shift', 'L'], '切换主题'],
    ],
  },
]

export default function Shortcuts() {
  return (
    <div className="h-screen flex flex-col">
      <GlassToolbar className="h-[56px] flex items-center px-5 flex-none">
        <span className="font-semibold">键盘快捷键</span>
        <Link to="/chat" className="ml-auto text-[13px] text-sub hover:text-cyan transition-colors">返回工作台</Link>
      </GlassToolbar>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[720px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10">
          {GROUPS.map((g) => (
            <div key={g.title} className="glass-panel p-5">
              <div className="text-[12px] text-sub uppercase tracking-wider mb-3">{g.title}</div>
              <div className="space-y-2.5">
                {g.items.map(([keys, desc]) => (
                  <div key={desc} className="flex items-center justify-between text-[13px]">
                    <span className="text-sub">{desc}</span>
                    <span className="flex gap-1">
                      {keys.map((k) => <Kbd key={k}>{k}</Kbd>)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
