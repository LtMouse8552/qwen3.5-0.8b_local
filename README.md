# Qwen3.5 Chat — 本地大模型聊天助手

基于 **Ollama + Streamlit** 的本地大模型聊天应用，内置 **RAG 知识库**：把文档放进 `datas/` 目录即可基于资料问答，数据完全留在本机。

配套前端 `web/` 为深色科技风 + 液态玻璃 UI（与 LocalRAG 同源界面），构建产物输出到 `docs/`，可直接通过 GitHub Pages 访问。

## ✨ 功能特点

- 💬 **流式对话**：调用 Ollama `/api/chat` 逐段输出，自动跳过模型思考部分
- 📚 **RAG 知识库**：加载 `datas/` 下的 PDF / Markdown / TXT，切片向量化存入 Chroma，回答基于资料生成
- 🧠 **本地 Embedding**：使用 `paraphrase-multilingual-MiniLM-L12-v2` 多语言向量模型，离线运行
- 🖥 **Web 前端**：React 18 + TypeScript + Vite + Tailwind 液态玻璃界面（流式回复、引用溯源、快捷键）
- 🪟 **Windows 一键脚本**：`start_ollama.bat` 启动 Ollama 并监听 `0.0.0.0`，局域网内其他设备可访问

## 🗂 目录结构

```
├── app.py                 # Streamlit 后端：聊天 + RAG 知识库
├── download_embedding.py  # 从 ModelScope 下载 Embedding 模型
├── start_ollama.bat       # Windows 启动 Ollama（监听所有网卡）
├── datas/                 # 知识库文档目录（PDF / MD / TXT）
├── vectors/               # Chroma 向量库存储
├── models/                # 本地 Embedding 模型
├── web/                   # React 前端源码
└── docs/                  # 前端构建产物（GitHub Pages）
```

## 🚀 快速开始

### 1. 准备环境

- 安装 [Ollama](https://ollama.com/) 并拉取模型：
  ```bash
  ollama pull qwen3.5:0.8B
  ```
- 安装 Python 依赖：
  ```bash
  pip install streamlit requests langchain-community langchain-huggingface langchain-text-splitters chromadb pymupdf
  ```

### 2. 下载 Embedding 模型（国内走 ModelScope）

```bash
python download_embedding.py
```

### 3. 放入知识库文档

将 PDF / Markdown / TXT 文档放入 `datas/` 目录。

### 4. 启动

```bash
# Windows：先启动 Ollama（局域网可访问）
start_ollama.bat

# 启动聊天应用
streamlit run app.py
# 访问 http://localhost:8501
```

### 5. （可选）前端

```bash
cd web
npm install
npm run dev      # 开发调试
npm run build    # 构建输出
```

## 🔧 可配置项

| 配置 | 位置 | 默认值 |
| --- | --- | --- |
| Ollama 地址 | `app.py` `OLLAMA_URL` | `http://localhost:11434/api/chat` |
| 模型名称 | `app.py` `MODEL_NAME` | `qwen3.5:0.8B` |
| 最大生成长度 / 温度 | 界面侧栏调节 | — |

## 📄 许可证

仅供学习交流使用。
