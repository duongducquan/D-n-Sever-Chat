@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ====================================================================
echo  🚀 KHỞI ĐỘNG HỆ THỐNG CHAT MÁY NÀY VỚI MÁY KIA (DDD + MYSQL WAMP)
echo ====================================================================
echo.
echo [1/2] Đang khởi động Backend TypeScript DDD trên cổng 5000...
start "Backend DDD Chat (Port 5000)" cmd /k "npm --prefix server run dev"

echo [2/2] Đang khởi động Frontend Next.js trên cổng 3000...
start "Frontend Next.js Chat (Port 3000)" cmd /k "npm --prefix client run dev"

echo.
echo ====================================================================
echo  ✅ HỆ THỐNG ĐÃ ĐƯỢC KHỞI CHẠY THÀNH CÔNG!
echo.
echo  👉 Trình duyệt máy này:       http://localhost:3000
echo  👉 Máy khác trong mạng LAN:    http://192.168.20.145:3000
echo  👉 API Backend:               http://localhost:5000/api/health
echo ====================================================================
pause
