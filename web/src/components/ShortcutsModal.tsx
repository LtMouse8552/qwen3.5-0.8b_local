import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GlassModal } from './glass'
import Kbd from './Kbd'

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: '全局',
    items: [
      ['Ctrl + K', '搜索会话'],
      ['Ctrl + N', '新建问答'],
      ['Ctrl + /', '打开快捷键帮助'],
    ],
  },
  {
    title: '对话',
    items: [
      ['Enter', '发送'],
      ['Shift + Enter', '换行'],
      ['Esc', '停止生成'],
      ['Ctrl + R', '重新生成'],
    ],
  },
  {
    title: '引用',
    items: [
      ['Alt + 1~9', '跳转到第 N 个引用'],
      ['Alt + ←', '返回上一个引用'],
    ],
  },
  {
    title: '界面',
    items: [
      ['Ctrl + B', '折叠左栏'],
      ['Ctrl + J', '折叠右栏'],
      ['Ctrl + Shift + L', '切换主题'],
    ],
  },
]

export default function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate()
  const location = useLocation()

  // Ctrl+/ 全局唤起
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        if (location.pathname !== '/shortcuts') nav('/shortcuts')
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [location.pathname, nav])

  return (
    <GlassModal open={open} onClose={onClose} title="键盘快捷键" width={620}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="text-[12px] text-sub uppercase tracking-wider mb-2">{g.title}</div>
            <div className="space-y-2">
              {g.items.map(([keys, desc]) => (
                <div key={keys} className="flex items-center justify-between text-[13px]">
                  <span className="text-sub">{desc}</span>
                  <span className="flex gap-1">
                    {keys.split(' + ').map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassModal>
  )
}
