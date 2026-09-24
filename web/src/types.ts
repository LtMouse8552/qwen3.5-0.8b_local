export type DocStatus = 'indexed' | 'parsing' | 'failed'

export interface KbDoc {
  id: string
  kbId: string
  name: string
  size: string        // 人类可读大小
  pages: number
  status: DocStatus
  progress: number    // 解析进度 0-100
  updatedAt: string
  chunks: number
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  docCount: number
  chunkCount: number
  createdAt: string
}

export interface Citation {
  id: number          // 引用编号 [1]
  docId: string
  docName: string
  page: number
  section: string
  similarity: number  // 0-100
  snippet: string     // 原文片段
  keyword: string     // 命中关键词（高亮用）
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string   // 模型思考过程（可选展示）
  citations?: Citation[]
  createdAt: number
  aborted?: boolean
}

export interface Conversation {
  id: string
  kbId: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface RagSettings {
  apiBase: string
  model: string
  temperature: number
  topP: number
  maxTokens: number
  topK: number
  threshold: number   // 相似度阈值 %
  rerank: boolean
  chunkSize: number
  theme: 'dark' | 'light'
  language: 'zh' | 'en'
  fontSize: number
  density: 'compact' | 'default'
}

export type StreamState =
  | { phase: 'idle' }
  | { phase: 'retrieving' }
  | { phase: 'streaming'; messageId: string }
