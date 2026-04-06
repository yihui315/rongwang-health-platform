@echo off
chcp 65001 >nul
echo ========================================
echo   一辉智能体 HTTP + Cloudflare Tunnel
echo ========================================
echo.

REM 检查 cloudflared
where cloudflared >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 未找到 cloudflared，请先安装:
    echo    winget install Cloudflare.cloudflared
    echo    或从 https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
    pause
    exit /b 1
)

REM 启动 HTTP 服务
echo 🚀 启动一辉智能体 HTTP 服务...
start "YihuiAgent-HTTP" cmd /c "cd /d %~dp0 && node http-server.js"
timeout /t 3 /nobreak >nul

REM 启动 Cloudflare Tunnel
echo 🌐 启动 Cloudflare Tunnel...
echo    隧道地址将在下方显示，复制 https://xxx.trycloudflare.com 到 .env.local
echo.
cloudflared tunnel --url http://localhost:8787

pause
