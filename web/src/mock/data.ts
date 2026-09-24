import type { KnowledgeBase, KbDoc, Conversation, Citation } from '../types'

// ---------- 知识库 ----------
export const mockKbs: KnowledgeBase[] = [
  { id: 'kb-1', name: '产品文档', description: '产品需求、功能说明与版本记录', docCount: 2, chunkCount: 186, createdAt: '2025-06-01' },
  { id: 'kb-2', name: '技术手册', description: 'API 设计、架构与部署手册', docCount: 2, chunkCount: 170, createdAt: '2025-06-12' },
  { id: 'kb-3', name: '会议纪要', description: '每周例会与评审记录', docCount: 1, chunkCount: 42, createdAt: '2025-07-02' },
]

// ---------- 文档 ----------
export const mockDocs: KbDoc[] = [
  { id: 'doc-1', kbId: 'kb-1', name: '产品需求文档.pdf', size: '2.4 MB', pages: 32, status: 'indexed', progress: 100, updatedAt: '2025-06-02', chunks: 128 },
  { id: 'doc-2', kbId: 'kb-1', name: '用户调研.docx', size: '856 KB', pages: 12, status: 'indexed', progress: 100, updatedAt: '2025-06-03', chunks: 58 },
  { id: 'doc-3', kbId: 'kb-2', name: 'API 设计.md', size: '64 KB', pages: 1, status: 'indexed', progress: 100, updatedAt: '2025-06-12', chunks: 96 },
  { id: 'doc-4', kbId: 'kb-2', name: '旧版说明.txt', size: '18 KB', pages: 1, status: 'failed', progress: 0, updatedAt: '2025-06-13', chunks: 0 },
  { id: 'doc-5', kbId: 'kb-3', name: '第 14 周例会纪要.md', size: '22 KB', pages: 1, status: 'indexed', progress: 100, updatedAt: '2025-07-02', chunks: 42 },
]

// ---------- 引用 ----------
export const mockCitations: Citation[] = [
  {
    id: 1, docId: 'doc-1', docName: '产品需求文档.pdf', page: 12, section: '3.2 登录模块',
    similarity: 94, keyword: '登录',
    snippet: '用户可以通过手机号或邮箱进行登录，登录成功后系统将颁发有效期 7 天的会话令牌。连续失败 5 次将触发账号保护策略，需通过验证码解锁。',
  },
  {
    id: 2, docId: 'doc-3', docName: 'API 设计.md', page: 1, section: 'POST /v1/auth/login',
    similarity: 88, keyword: '令牌',
    snippet: '登录接口接收 username 与 password 字段，验证通过后返回 access_token 与 refresh_token。access_token 有效期 2 小时，refresh_token 有效期 30 天。',
  },
  {
    id: 3, docId: 'doc-2', docName: '用户调研.docx', page: 7, section: '问卷开放题汇总',
    similarity: 76, keyword: '验证码',
    snippet: '约 62% 的受访者表示希望登录流程支持免密验证码，减少密码记忆负担；另有部分用户关心异常登录提醒的及时性。',
  },
]

// ---------- 会话 ----------
const now = Date.now()
const H = 3600_000, D = 24 * H

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1', kbId: 'kb-1', title: '登录流程', createdAt: now - 2 * H, updatedAt: now - 2 * H,
    messages: [
      { id: 'm1', role: 'user', content: '总结一下登录流程的设计要点', createdAt: now - 2 * H },
      {
        id: 'm2', role: 'assistant', createdAt: now - 2 * H + 4000,
        content: '登录流程的设计要点如下：\n\n1. **多方式登录**：支持手机号与邮箱 [1]\n2. **令牌机制**：签发 7 天会话令牌 [1]，API 层面 access_token 2 小时 + refresh_token 30 天 [2]\n3. **安全策略**：连续失败 5 次触发账号保护，需验证码解锁 [1]\n4. **用户期望**：多数受访者希望支持免密验证码登录 [3]',
        citations: mockCitations,
      },
    ],
  },
  {
    id: 'conv-2', kbId: 'kb-2', title: '接口设计', createdAt: now - 26 * H, updatedAt: now - 26 * H,
    messages: [
      { id: 'm3', role: 'user', content: '列出所有鉴权相关接口', createdAt: now - 26 * H },
      { id: 'm4', role: 'assistant', content: '根据 API 设计文档，鉴权相关接口包括：\n\n- `POST /v1/auth/login` 登录 [1]\n- `POST /v1/auth/refresh` 刷新令牌\n- `POST /v1/auth/logout` 注销', citations: [mockCitations[1]], createdAt: now - 26 * H + 3000 },
    ],
  },
  {
    id: 'conv-3', kbId: 'kb-1', title: '版本对比', createdAt: now - 3 * D, updatedAt: now - 3 * D,
    messages: [
      { id: 'm5', role: 'user', content: '对比两个版本的登录模块差异', createdAt: now - 3 * D },
      { id: 'm6', role: 'assistant', content: '旧版说明与新版需求的主要差异：新增了邮箱登录、账号保护策略与异常登录提醒。', createdAt: now - 3 * D + 2500 },
    ],
  },
]

// ---------- 模拟流式回答语料 ----------
export const mockAnswers: Record<string, string> = {
  default:
    '根据知识库检索结果，为你总结如下：\n\n1. **核心机制** [1]：系统采用会话令牌机制，登录成功后签发有效期 7 天的令牌。\n2. **接口设计** [2]：`POST /v1/auth/login` 返回 `access_token` 与 `refresh_token`，前者 2 小时有效，后者 30 天。\n3. **用户反馈** [3]：62% 的受访者希望支持免密验证码登录。\n\n```json\n{\n  "access_token": "<JWT>",\n  "expires_in": 7200,\n  "refresh_token": "<JWT>"\n}\n```\n\n> 提示：以上内容全部来自本地知识库，引用编号可点击查看原文。',
  '总结文档':
    '# 产品需求文档摘要\n\n本文档共 32 页，核心内容包括：\n\n- **产品定位**：面向中小团队的私有知识管理工具 [1]\n- **登录模块**：手机号 / 邮箱双通道，7 天会话令牌 [1]\n- **安全策略**：连续失败 5 次锁定，验证码解锁 [1]\n- **调研结论**：用户偏好免密登录与及时异常提醒 [3]',
  '找出关键流程':
    '关键流程梳理：\n\n1. 登录 → 校验 → 签发令牌 [1][2]\n2. 令牌过期 → refresh_token 换新 [2]\n3. 异常登录 → 触发保护 → 验证码解锁 [1]',
  '对比两个版本':
    '| 能力 | 旧版 | 新版 |\n| --- | --- | --- |\n| 登录方式 | 仅密码 | 手机号 + 邮箱 [1] |\n| 令牌 | 固定会话 | access + refresh [2] |\n| 保护策略 | 无 | 失败 5 次锁定 [1] |',
  '列出所有接口':
    '鉴权相关接口清单 [2]：\n\n- `POST /v1/auth/login` — 登录\n- `POST /v1/auth/refresh` — 刷新令牌\n- `POST /v1/auth/logout` — 注销\n\n完整字段说明见 API 设计文档。',
}

// 依据用户输入挑选回答：命中建议关键词用对应语料，否则 default
export function pickAnswer(q: string): string {
  for (const key of Object.keys(mockAnswers)) {
    if (key !== 'default' && q.includes(key.replace(/文档|流程|版本|接口/, ''))) return mockAnswers[key]
  }
  return mockAnswers.default
}
