import type { Citation } from '../types'

export interface StreamHandle {
  stop: () => void
}

/** Ollama /api/chat 流式响应的单行 chunk */
interface OllamaChatChunk {
  message?: { role?: string; content?: string; thinking?: string }
  done?: boolean
}

/**
 * 调用本机 Ollama `/api/chat` 真实流式输出：
 * 1. onChunk：增量正文文本
 * 2. onThinking：思考过程增量（模型支持 think 时）
 * 3. onDone：流结束（含被 stop() 主动终止）
 */
export function ollamaChatStream(
  opts: {
    apiBase: string
    model: string
    messages: { role: 'user' | 'assistant'; content: string }[]
    temperature?: number
    numPredict?: number
    think?: boolean
  },
  onChunk: (text: string) => void,
  onThinking: (text: string) => void,
  onDone: () => void,
  onError?: (msg: string) => void,
): StreamHandle {
  const controller = new AbortController()
  let stopped = false

  ;(async () => {
    try {
      const resp = await fetch(`${opts.apiBase.replace(/\/+$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: opts.model,
          messages: opts.messages,
          stream: true,
          think: opts.think ?? false,
          options: {
            temperature: opts.temperature ?? 0.7,
            num_predict: opts.numPredict ?? 2048,
          },
        }),
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const reader = resp.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim() || stopped) continue
          let d: OllamaChatChunk
          try {
            d = JSON.parse(line)
          } catch {
            continue
          }
          if (d.done) break
          const m = d.message ?? {}
          if (m.thinking) onThinking(m.thinking)
          if (m.content) onChunk(m.content)
        }
      }
      if (!stopped) onDone()
    } catch (e) {
      if (!stopped) {
        const msg = e instanceof Error ? e.message : String(e)
        if (onError) onError(msg)
        onDone()
      }
    }
  })()

  return {
    stop() {
      stopped = true
      controller.abort()
      onDone()
    },
  }
}

/** 引用占位：本地直连 Ollama 暂无检索后端，保留类型兼容 */
export const emptyCitations: Citation[] = []
