/** 键帽：等宽字体 + 实色底，保证可读性 */
export default function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="kbd inline-flex items-center justify-center min-w-[24px] h-[22px] px-1.5 rounded-[6px] text-[11.5px]"
      style={{ background: '#161F2A', border: '1px solid #24303D', color: '#E6EDF3' }}
    >
      {children}
    </kbd>
  )
}
