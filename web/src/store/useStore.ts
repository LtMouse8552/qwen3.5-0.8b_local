import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, ChatMessage, Citation, KbDoc, KnowledgeBase, RagSettings } from '../types'
import { mockKbs, mockDocs, mockConversations } from '../mock/data'

interface AppState {
  kbs: KnowledgeBase[]
  docs: KbDoc[]
  conversations: Conversation[]
  activeConvId: string | null
  activeKbId: string
  settings: RagSettings
  // actions
  setActiveKb: (id: string) => void
  setActiveConv: (id: string | null) => void
  newConversation: (kbId: string) => string
  appendMessage: (convId: string, msg: ChatMessage) => void
  updateMessage: (convId: string, msgId: string, patch: Partial<ChatMessage>) => void
  removeMessage: (convId: string, msgId: string) => void
  deleteConversation: (id: string) => void
  addDoc: (doc: KbDoc) => void
  updateDoc: (id: string, patch: Partial<KbDoc>) => void
  addKb: (kb: KnowledgeBase) => void
  deleteKb: (id: string) => void
  setSettings: (patch: Partial<RagSettings>) => void
  clearHistory: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

// API 地址自动探测：本地开发用 localhost，部署后用页面所在主机（与 docs/index.html 逻辑一致）
function detectApiBase(): string {
  const saved = localStorage.getItem('ollamaApi')
  if (saved) return saved
  const host = window.location.hostname
  if (!host || host === 'localhost' || host === '127.0.0.1') return 'http://localhost:11434'
  return `http://${host}:11434`
}

export const defaultSettings: RagSettings = {
  apiBase: detectApiBase(),
  model: 'qwen3.5:0.8B',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  topK: 4,
  threshold: 70,
  rerank: true,
  chunkSize: 500,
  theme: 'dark',
  language: 'zh',
  fontSize: 15,
  density: 'default',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      kbs: mockKbs,
      docs: mockDocs,
      conversations: mockConversations,
      activeConvId: null,
      activeKbId: 'kb-1',
      settings: defaultSettings,

      setActiveKb: (id) => set({ activeKbId: id }),
      setActiveConv: (id) => set({ activeConvId: id }),

      newConversation: (kbId) => {
        const id = 'conv-' + uid()
        const conv: Conversation = {
          id, kbId, title: '新问答', messages: [],
          createdAt: Date.now(), updatedAt: Date.now(),
        }
        set((s) => ({ conversations: [conv, ...s.conversations], activeConvId: id }))
        return id
      },

      appendMessage: (convId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [...c.messages, msg],
                  title: c.messages.length === 0 && msg.role === 'user' ? msg.content.slice(0, 18) : c.title,
                  updatedAt: Date.now(),
                }
              : c,
          ),
        })),

      updateMessage: (convId, msgId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) }
              : c,
          ),
        })),

      removeMessage: (convId, msgId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) } : c,
          ),
        })),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConvId: s.activeConvId === id ? null : s.activeConvId,
        })),

      addDoc: (doc) => set((s) => ({ docs: [...s.docs, doc] })),
      updateDoc: (id, patch) =>
        set((s) => ({ docs: s.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      addKb: (kb) => set((s) => ({ kbs: [...s.kbs, kb] })),
      deleteKb: (id) =>
        set((s) => ({
          kbs: s.kbs.filter((k) => k.id !== id),
          docs: s.docs.filter((d) => d.kbId !== id),
          activeKbId: s.activeKbId === id ? (s.kbs[0]?.id ?? '') : s.activeKbId,
        })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      clearHistory: () => set({ conversations: [], activeConvId: null }),
    }),
    {
      name: 'localrag-store',
      partialize: (s) => ({ conversations: s.conversations, settings: s.settings, activeKbId: s.activeKbId }),
    },
  ),
)

// ---------- 选择器辅助 ----------
export function groupConversations(convs: Conversation[]) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const groups: Record<string, Conversation[]> = { 今天: [], 昨天: [], 更早: [] }
  for (const c of [...convs].sort((a, b) => b.updatedAt - a.updatedAt)) {
    if (c.updatedAt >= startOfDay) groups['今天'].push(c)
    else if (c.updatedAt >= startOfDay - 86400_000) groups['昨天'].push(c)
    else groups['更早'].push(c)
  }
  return groups
}

export { uid }
