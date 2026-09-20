"""Qwen3.5 Chat — 本地大模型聊天助手（Ollama + Streamlit + RAG 知识库）

启动: streamlit run app.py
访问: http://localhost:8501
"""
import os
import requests
import streamlit as st

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen3.5:0.8B"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_DOCS_DIR = os.path.join(BASE_DIR, "datas")
KB_VECTOR_DIR = os.path.join(BASE_DIR, "vectors")
EMBEDDING_MODEL_DIR = os.path.join(BASE_DIR, "models",
                                   "models",
                                   "sentence-transformers--paraphrase-multilingual-MiniLM-L12-v2",
                                   "snapshots", "master")

# ---------------- Ollama 流式调用 ----------------

def stream_chat(messages, max_tokens, temperature):
    """调用 Ollama /api/chat，逐段 yield 回复内容（跳过思考部分）。"""
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": True,
        "think": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": temperature,
        },
    }
    with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=300) as resp:
        resp.raise_for_status()
        for line in resp.iter_lines(decode_unicode=True):
            if not line:
                continue
            import json
            data = json.loads(line)
            if data.get("done"):
                break
            content = data.get("message", {}).get("content", "")
            if content:
                yield content

# ---------------- 知识库 (RAG) ----------------

class KnowledgeBase:
    def __init__(self):
        os.makedirs(KB_DOCS_DIR, exist_ok=True)
        os.makedirs(KB_VECTOR_DIR, exist_ok=True)
        self.vectorstore = None
        self.ready = False

    def init_knowledge_base(self):
        """加载 datas/ 下的文档，切片并向量化存入 Chroma。"""
        try:
            from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_community.vectorstores import Chroma

            file_paths = []
            for root, _dirs, files in os.walk(KB_DOCS_DIR):
                for f in files:
                    if f.lower().endswith((".pdf", ".md", ".txt")):
                        file_paths.append(os.path.join(root, f))
            if not file_paths:
                st.warning("知识库目录 datas/ 中没有找到任何文档")
                return False

            documents = []
            for fp in file_paths:
                try:
                    ext = fp.rsplit(".", 1)[-1].lower()
                    if ext == "pdf":
                        loader = PyMuPDFLoader(fp)
                    else:  # md / txt 统一按纯文本读取，避免依赖 unstructured
                        loader = TextLoader(fp, encoding="utf-8")
                    documents.extend(loader.load())
                except Exception as e:
                    st.warning(f"加载文档 {fp} 时出错: {e}")

            if not documents:
                st.error("没有可用的文档内容")
                return False

            splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            split_docs = splitter.split_documents(documents)

            embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_DIR)
            self.vectorstore = Chroma.from_documents(
                documents=split_docs,
                embedding=embeddings,
                persist_directory=KB_VECTOR_DIR,
            )
            self.ready = True
            return True
        except Exception as e:
            st.error(f"初始化知识库时出错: {e}")
            return False

    def query(self, question, k=3):
        if not self.ready:
            return None, None
        try:
            docs = self.vectorstore.similarity_search(question, k=k)
            context = "\n\n".join(d.page_content for d in docs)
            sources = [d.metadata.get("source", "未知") for d in docs]
            return context, sources
        except Exception as e:
            st.error(f"查询知识库时出错: {e}")
            return None, None

# ---------------- Streamlit 界面 ----------------

st.set_page_config(page_title="Qwen3.5 Chat", page_icon="🤖")
st.title("Qwen3.5 Chat")
st.caption(f"本地模型：`{MODEL_NAME}` · Ollama · CPU 可运行")

# 会话状态初始化
if "messages" not in st.session_state:
    st.session_state.messages = []
if "memory_enabled" not in st.session_state:
    st.session_state.memory_enabled = False
if "memory_rounds" not in st.session_state:
    st.session_state.memory_rounds = 3
if "kb_enabled" not in st.session_state:
    st.session_state.kb_enabled = False

kb = st.session_state.get("kb") or KnowledgeBase()
st.session_state.kb = kb

# 历史消息展示
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 侧边栏
with st.sidebar:
    st.header("⚙️ 控制面板")

    with st.expander("模型配置", expanded=True):
        max_tokens = st.slider("最大生成长度", 100, 2048, 1024, 100)
        temperature = st.slider("温度系数", 0.1, 2.0, 1.0, 0.1)

    with st.expander("记忆设置", expanded=True):
        st.session_state.memory_enabled = st.checkbox(
            "启用对话记忆", value=st.session_state.memory_enabled)
        st.session_state.memory_rounds = st.slider(
            "记忆轮数", 1, 10, st.session_state.memory_rounds,
            disabled=not st.session_state.memory_enabled,
            help="控制模型记住之前的对话轮数")

    with st.expander("知识库设置", expanded=True):
        st.session_state.kb_enabled = st.checkbox(
            "启用知识库", value=st.session_state.kb_enabled)
        if st.session_state.kb_enabled:
            if not kb.ready:
                with st.spinner("正在初始化知识库..."):
                    if kb.init_knowledge_base():
                        st.success("知识库初始化成功!")
                    else:
                        st.error("知识库初始化失败")
            else:
                st.success("知识库已就绪")
            if kb.ready and st.button("重新加载知识库"):
                with st.spinner("正在重新加载知识库..."):
                    st.session_state.kb = KnowledgeBase()
                    if st.session_state.kb.init_knowledge_base():
                        st.success("知识库重新加载成功!")
                    else:
                        st.error("知识库重新加载失败")
                        st.session_state.kb = kb

    with st.expander("知识库管理", expanded=True):
        uploaded_files = st.file_uploader(
            "上传文档到知识库 (PDF/MD/TXT)",
            type=["pdf", "md", "txt"],
            accept_multiple_files=True,
        )
        if uploaded_files and st.button("上传并更新知识库"):
            for uf in uploaded_files:
                path = os.path.join(KB_DOCS_DIR, uf.name)
                with open(path, "wb") as f:
                    f.write(uf.getbuffer())
                st.success(f"已保存 {uf.name} 到知识库")
            with st.spinner("正在更新知识库..."):
                st.session_state.kb = KnowledgeBase()
                if st.session_state.kb.init_knowledge_base():
                    st.success("知识库更新成功!")
                    st.rerun()
                else:
                    st.error("知识库更新失败")
                    st.session_state.kb = kb

    with st.expander("系统操作", expanded=True):
        if st.button("🧹 清空对话历史"):
            st.session_state.messages = []
            st.rerun()

# 聊天输入
if prompt := st.chat_input("请输入您的问题..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        placeholder = st.empty()
        full_response = ""

        # 构建历史上下文（如果启用记忆）
        history = None
        if st.session_state.memory_enabled and len(st.session_state.messages) > 1:
            history_msgs = st.session_state.messages[:-1]
            keep = min(st.session_state.memory_rounds * 2, len(history_msgs))
            history = history_msgs[-keep:]

        # 查询知识库（如果启用）
        kb_context = None
        kb_sources = None
        if st.session_state.kb_enabled and kb.ready:
            with st.spinner("正在查询知识库..."):
                kb_context, kb_sources = kb.query(prompt)

        # 组装消息：知识库上下文注入 + 历史 + 当前问题
        user_content = prompt
        if kb_context:
            user_content = f"基于以下知识库信息回答问题:\n{kb_context}\n\n问题: {prompt}"
        chat_messages = (history or []) + [{"role": "user", "content": user_content}]

        # 流式输出
        try:
            for chunk in stream_chat(chat_messages, max_tokens, temperature):
                full_response += chunk
                placeholder.markdown(full_response + "▌")
        except requests.RequestException as e:
            full_response = f"⚠️ 调用 Ollama 失败：{e}\n请确认 Ollama 服务已启动。"
        placeholder.markdown(full_response or "（模型未返回内容）")

        if kb_sources:
            st.caption("📚 知识库来源: " + ", ".join(os.path.basename(s) for s in kb_sources))

    st.session_state.messages.append({"role": "assistant", "content": full_response})
