/** 版本徽章 */
export default function VersionBadge({ v = '1.0.0' }: { v?: string }) {
  return (
    <span className="text-[10.5px] px-1.5 py-0.5 rounded-md border border-cyan/40 text-cyan font-mono align-middle">
      v{v}
    </span>
  )
}
