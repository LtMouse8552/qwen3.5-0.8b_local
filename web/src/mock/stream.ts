import type { Citation } from '../types'
import { mockCitations, pickAnswer } from './data'

export interface StreamHandle {
  stop: () => void
}

/**
 * 模拟 RAG 流式输出：
 * 1. 检索阶段（~900ms）→ 回调 citations
 * 2. 逐字输出答案 → onChunk；可随时 stop()
 */
export function mockRagStream(
  question: string,
  onRetrieved: (cites: Citation[]) => void,
  onChunk: (text: string) => void,
  onDone: () => void,
): StreamHandle {
  let stopped = false
  let timer: number | undefined

  // 检索阶段：模拟 900ms 后返回引用
  const retrieveTimer = window.setTimeout(() => {
    if (stopped) return
    onRetrieved(mockCitations)
    // 开始流式输出
    const full = pickAnswer(question)
    let i = 0
    timer = window.setInterval(() => {
      if (stopped) return
      // 每次输出 2-4 个字符，模拟逐字
      const step = 2 + Math.floor(Math.random() * 3)
      i = Math.min(i + step, full.length)
      onChunk(full.slice(0, i))
      if (i >= full.length) {
        window.clearInterval(timer)
        if (!stopped) onDone()
      }
    }, 30)
  }, 900)

  return {
    stop() {
      stopped = true
      window.clearTimeout(retrieveTimer)
      if (timer) window.clearInterval(timer)
      onDone()
    },
  }
}
