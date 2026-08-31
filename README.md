# FMS Frontend

Dashboard Fleet Management System (FMS) — React + TypeScript + Vite + Ant Design + Leaflet.

## Fitur Utama

- **Live Tracking** — peta realtime dengan Socket.IO (`equipment-status-update`, `new-alert`, dll.)
- **Geofence** — kelola area/zona dengan draw & layer peta
- **Alert** — notifikasi overspeed, underspeed, offtrack, fuel decrease
- **Dashboard, Report, Graphic** — statistik, equipment logs, activity summary
- **Master Data & Upload Data** — equipment, shift, daily setting operator, weighbridge (import Excel)
- **Position History** — riwayat pergerakan per equipment

---

## Teknologi

| Bagian | Teknologi |
|---|---|
| Framework | React 19 + TypeScript + Vite 8 |
| UI | Ant Design 6, lucide-react |
| Map | Leaflet, react-leaflet 5, leaflet-draw |
| Data | TanStack Query, Zustand, Axios |
| Realtime | socket.io-client |
| Chart | ECharts, Recharts |

---

## Struktur Environment

| Variable | Fungsi | Production |
|---|---|---|
| `VITE_API_URL` | Base URL API (`axios` `baseURL`) | `/` (di-proxy web server) |
| `VITE_BACKEND_URL` | Target proxy dev saja (`/fms/api`, `/socket.io`) | **tidak dipakai** di build |
| `VITE_SOCKET_URL` | URL Socket.IO. Kosong → fallback `window.location.origin` | kosong (ikut origin) |
| `VITE_REALTIME_MODE` | `polling` \| `socket` | `socket` |
| `VITE_APP_NAME` | Nama aplikasi | `FMS Enterprise` |

> **Catatan penting:** `VITE_BACKEND_URL` **hanya** dipakai oleh proxy dev server (`vite dev`). Nilai ini **tidak ikut terbundle** ke production. Di production, reverse proxy (nginx/IIS) yang menangani routing `/fms/api` dan `/socket.io` ke backend.

---

## Step-by-Step Publish ke Production (Windows 10 VPS + PM2)

### 1. Persiapan di Komputer Lokal (Dev)

```powershell
# a. Install dependencies
npm install

# b. Build production (validasi sebelum push)
npm run build
# => output folder: dist/
```

> Pastikan build **lolos tanpa error** (`tsc -b && vite build`). Build gagal = jangan push.

### 2. Commit & Push ke GitHub

```powershell
git add -A
git commit -m "feat: release ke production"
git push origin main
```

> Repo ini menggunakan branch `main` sebagai branch utama (sudah sama dengan `origin/main`).

### 3. Clone di Server VPS Windows 10

```powershell
# a. Buka PowerShell (run as admin) di server
cd D:\RMK\FMS   # atau folder tempat app akan disimpan

# b. Clone repo
git clone https://github.com/<username>/<repo>.git fms-frontend
cd fms-frontend
```

### 4. Install Node.js & PM2 di Server

```powershell
# a. Install Node.js LTS (via installer dari nodejs.org, atau winget)
winget install OpenJS.NodeJS.LTS

# b. Cek versi
node -v
npm -v

# c. Install PM2 global
npm install -g pm2

# d. Install pm2-windows-startup agar PM2 auto-start saat server reboot
npm install -g pm2-windows-startup
pm2-startup install
```

> ⚠️ **Windows ≠ Linux:** `pm2 startup` (perintah Linux) tidak berfungsi di Windows. Gunakan `pm2-windows-startup` di atas.

### 5. Buat Env Production di Server

Buat file `.env.production` di folder `fms-frontend`:

```ini
# .env.production
VITE_API_URL=/
VITE_SOCKET_URL=
VITE_BACKEND_URL=http://localhost:3346
VITE_REALTIME_MODE=socket
VITE_APP_NAME=FMS Enterprise
```

> `VITE_SOCKET_URL` dikosongkan → frontend otomatis pakai `window.location.origin` (origin yang sama dengan web server). Jadi Socket.IO mengikuti domain web server, bukan backend port.

### 6. Install Dependencies & Build di Server

```powershell
npm install
npm run build
```

### 7. Jalankan dengan PM2

Buat file `ecosystem.config.cjs` di folder project:

```js
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'fms-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 8881',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

Lalu jalankan:

```powershell
pm2 start ecosystem.config.cjs
pm2 save              # simpan daftar proses
pm2 status            # cek status
```

Akses sementara: `http://<IP-VPS>:8881`

> Vite preview hanya untuk tahap awal. Untuk produksi yang lebih stabil, pertimbangkan `serve`/Nginx/IIS sebagai static file server (lihat langkah 9).

### 8. Konfigurasi Reverse Proxy (WAJIB untuk API & Socket)

Frontend mengakses:
- API: `/fms/api/*` → backend
- Socket.IO: `/socket.io/*` → backend (websocket)

**Contoh Nginx:**

```nginx
server {
    listen 80;
    server_name fms.example.com;

    root D:/RMK/FMS/fms-frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /fms/api/ {
        proxy_pass http://127.0.0.1:3346;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.IO proxy (websocket)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3346;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**Contoh IIS (URL Rewrite + ARR):** buat site yang mengarah ke folder `dist`, lalu tambahkan rewrite rules:

```xml
<rewrite>
  <rules>
    <rule name="SPA fallback" stopProcessing="true">
      <match url=".*" />
      <conditions logicalGrouping="MatchAll">
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
      </conditions>
      <action type="Rewrite" url="/index.html" />
    </rule>
    <rule name="API proxy">
      <match url="^fms/api/(.*)" />
      <action type="Rewrite" url="http://127.0.0.1:3346/fms/api/{R:1}" />
    </rule>
    <rule name="Socket proxy">
      <match url="^socket.io/(.*)" />
      <action type="Rewrite" url="http://127.0.0.1:3346/socket.io/{R:1}" />
    </rule>
  </rules>
</rewrite>
```

> Untuk Socket.IO via IIS, pastikan ARR + WebSocket protocol diaktifkan di IIS, atau langsung arahkan `/socket.io` ke port backend.

### 9. (Opsional) Ganti Vite Preview dengan Static Server

Vite preview kurang cocok untuk beban produksi besar. Alternatif dengan PM2 + `serve`:

```powershell
npm install -g serve
# edit ecosystem: script: 'serve', args: '-s dist -l 8881'
pm2 restart ecosystem.config.cjs
```

### 10. Startup Otomatis & Update Berikutnya

```powershell
# Pastikan PM2 berjalan otomatis saat reboot (sudah via pm2-startup)
pm2 save

# Update versi baru
cd D:\RMK\FMS\fms-frontend
git pull origin main
npm install
npm run build
pm2 restart fms-frontend
```

---

## Perintah Penting

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server (port 8881, proxy ke `VITE_BACKEND_URL`) |
| `npm run build` | Typecheck + build production ke `dist/` |
| `npm run lint` | ESLint (error `react-refresh` tidak menghalangi build) |
| `pm2 status` / `pm2 logs` | Cek status & log PM2 |
| `pm2 restart fms-frontend` | Restart aplikasi |

---

## Troubleshooting

- **Build error TS6133 / TS2322** — pastikan `npm run build` lolos sebelum push; error umumnya unused variable & tipe `Dayjs` di form (sudah ditangani dengan cast `as unknown as string`).
- **Socket tidak connect** — cek reverse proxy `/socket.io` sudah meneruskan `Upgrade`/`Connection: upgrade` (webSocket).
- **API 404 di production** — pastikan `/fms/api` di-proxy ke backend; `VITE_BACKEND_URL` tidak berlaku di production.
- **PM2 tidak auto-start saat reboot** — jalankan ulang `pm2-startup install` dan `pm2 save`.
