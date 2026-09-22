# Qwen3.5 本地聊天应用

基于本地 Ollama 运行的 Qwen3.5:0.8B 聊天应用，包含三种形态：

- **Streamlit 版**（`app.py`）：带 RAG 知识库（Chroma + 多语言 embedding），可导入 PDF/MD/TXT 文档
- **静态网页版**（`docs/index.html`）：LocalRAG 暗色玻璃风格聊天页，带引用来源面板，可部署到 GitHub Pages 等静态托管
- **API**：Ollama 原生接口（兼容 OpenAI `/v1/chat/completions` 格式）

## 快速开始（本机）

1. 安装 [Ollama](https://ollama.com) 并拉取模型：

   ```bash
   ollama pull qwen3.5:0.8B
   ```

2. 启动 Streamlit 应用：

   ```bash
   pip install -r requirements.txt   # 如无则按 import 手动安装
   streamlit run app.py
   ```

3. 或直接用浏览器打开 `docs/index.html`（需 Ollama 在本机运行）。

## 局域网访问

1. 双击 `start_ollama.bat`（或设置环境变量 `OLLAMA_HOST=0.0.0.0` 后启动 Ollama），使 Ollama 监听所有网卡。
2. 查询本机内网 IP（`ipconfig`，如 `10.80.221.22`）。
3. 局域网内其他设备：
   - 网页版：打开 `http://<内网IP>:11434` 所在主机的 `docs/index.html`（页面会自动探测 `http://<主机IP>:11434`）
   - API：`http://<内网IP>:11434/v1/chat/completions`
   - Streamlit：`streamlit run app.py --server.address 0.0.0.0` 后访问 `http://<内网IP>:8501`
4. 首次访问如被 Windows 防火墙拦截，需放行 Ollama/Python 的入站连接。

## 公网访问（Cloudflare Tunnel 快速隧道）

无需公网 IP、无需开放路由器端口：

1. 下载 [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)，放到项目目录。

2. 启动隧道（指向本机 Ollama）：

   ```bash
   cloudflared tunnel --url http://127.0.0.1:11434
   ```

   输出中会打印一个临时公网地址，例如：

   ```
   https://xxxx-yyyy-zzzz.trycloudflare.com
   ```

3. 验证可用：

   ```bash
   curl https://xxxx-yyyy-zzzz.trycloudflare.com/api/version
   ```

4. 把这个地址发给外部用户：
   - 直接调 API（Ollama 原生格式）
   - 或在任何支持自定义 OpenAI 接口的客户端填 `https://xxxx.trycloudflare.com/v1`

> **注意**
> - 快速隧道地址**每次重启都会变化**，重启后重新获取即可。
> - 免费隧道**无鉴权**：任何拿到地址的人都能调用模型，甚至调用管理接口（删除模型等）。请勿公开发布地址；对外服务建议在前面加一层带 API Key 鉴权的网关。

## 网页版部署到 GitHub Pages（对外提供常驻入口）

`docs/` 目录可直接作为 GitHub Pages 站点：

1. GitHub 仓库 → Settings → Pages → Source 选择 `main` 分支 `/docs` 目录。
2. 访问 `https://<用户名>.github.io/<仓库名>/` 即得聊天页。
3. 由于 GitHub Pages 是纯静态托管，页面本身不含模型服务：打开页面后**点击右上角连接状态栏**，填入你的 Ollama 公网地址（如上面的隧道地址），设置会保存在浏览器 localStorage，之后自动连接。

页面 API 探测优先级：手动设置（localStorage）> 同源地址 > 局域网主机 > 本机。本地打开 `index.html` 时行为不变。

## 项目结构

```
app.py                 # Streamlit 应用（RAG 知识库 + 聊天）
docs/index.html        # 静态网页聊天版（可部署 GitHub Pages）
download_embedding.py  # 下载多语言 embedding 模型
datas/                 # 知识库原始文档
vectors/               # Chroma 向量库（本地生成，不入库）
start_ollama.bat       # 以 0.0.0.0 启动 Ollama（局域网开放）
```
