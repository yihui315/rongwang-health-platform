@echo off
chcp 65001 >nul
title 一辉智能体 — 引擎启动器

echo ╔══════════════════════════════════════════╗
echo ║   一辉智能体 v5.0 — 引擎启动器          ║
echo ╚══════════════════════════════════════════╝
echo.

:: 检查并启动 Ollama
echo [1/3] 检查 Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL% == 0 (
    echo   ✅ Ollama 已在运行
) else (
    echo   🚀 启动 Ollama...
    start "" /MIN ollama serve
    timeout /T 5 /NOBREAK >NUL
    echo   ✅ Ollama 已启动
)

:: 检查 Qwen3 模型
echo.
echo [2/3] 检查 Qwen3 模型...
ollama list 2>NUL | find "qwen3" >NUL
if %ERRORLEVEL% == 0 (
    echo   ✅ Qwen3 模型已就绪
) else (
    echo   📥 正在下载 Qwen3-Coder 30B...
    echo   ⏳ 首次下载约需 20-40 分钟
    start "" /MIN cmd /c "ollama pull qwen3-coder:30b"
    echo   📥 后台下载中...
)

:: 检查并启动 Copilot API
echo.
echo [3/3] 检查 Copilot API...
where copilot-api >NUL 2>NUL
if %ERRORLEVEL% == 0 (
    curl -s http://localhost:4141/v1/models >NUL 2>NUL
    if %ERRORLEVEL% == 0 (
        echo   ✅ Copilot API 已在运行
    ) else (
        echo   🚀 启动 Copilot API...
        start "" /MIN cmd /c "copilot-api start"
        timeout /T 10 /NOBREAK >NUL
        echo   ✅ Copilot API 已启动
    )
) else (
    echo   ⚠️ copilot-api 未安装
    echo   安装: npm install -g copilot-api
)

:: 运行连接测试
echo.
echo ════════════════════════════════════════════
echo 运行连接测试...
echo.
cd /d "%~dp0"
node test-connections.js

echo.
echo ════════════════════════════════════════════
echo 所有引擎已启动！可以开始使用一辉智能体了。
echo.
pause
