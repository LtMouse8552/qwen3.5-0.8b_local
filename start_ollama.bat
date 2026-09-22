@echo off
rem 启动 Ollama 并监听所有网卡（局域网可访问）
set OLLAMA_HOST=0.0.0.0
start "Ollama" /D "C:\Users\SSxuaner\AppData\Local\Programs\Ollama" "ollama app.exe"
