# Panduan Update dan Running FMS Frontend

Dokumen ini menjelaskan proses update dari laptop lokal ke server serta menjalankan aplikasi menggunakan PM2.

> **Asumsi:** laptop dan server sudah berada pada repository Git yang sama dan menggunakan branch `main`.

## 1. Update dari Laptop Lokal

Masuk ke root project:

```powershell
cd D:\RMK\FMS\FRONTEND\fms-frontend
```

Setelah selesai mengubah kode, lakukan validasi dan push:
 lakukan dulu
```powershell
npm run lint
npm run build

git status
git add -A
git commit -m "update: fms frontend"
git pull --rebase origin main
git push origin main
```

Keterangan:

- `npm run lint` memeriksa kualitas kode.
- `npm run build` memastikan aplikasi dapat dibuild untuk production.
- `git pull --rebase origin main` mengambil perubahan terbaru sebelum push.
- `git push origin main` mengirim perubahan ke repository utama.

Jangan lanjut ke server jika `npm run build` gagal.

## 2. Update di Server

Masuk ke server menggunakan akun yang menjalankan PM2, lalu masuk ke folder project:

```powershell
cd D:\RMK\FMS\FRONTEND\fms-frontend
```

Ambil perubahan terbaru dari branch `main`:

```powershell
git checkout main
git pull --ff-only origin main
```

Install dependency dan build ulang aplikasi:

```powershell
npm ci
npm run build
```

Jika build berhasil, restart aplikasi:

```powershell
pm2 restart fms-frontend --update-env
pm2 save
pm2 status
```

Pastikan status aplikasi adalah `online`.

> Jika server memiliki perubahan lokal, jangan gunakan `git reset --hard` sebelum memastikan perubahan tersebut tidak dibutuhkan. Simpan atau backup terlebih dahulu.

## 3. Setup PM2 dan Auto-start Server

### Instalasi pertama kali di server Windows

```powershell
npm install --global pm2

cd D:\RMK\FMS\FRONTEND\fms-frontend
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

File `ecosystem.config.cjs` sudah tersedia di root project dan menjalankan frontend pada port `8881`.

### Aktifkan PM2 otomatis setelah Windows restart

Buka PowerShell sebagai Administrator, kemudian jalankan:

```powershell
npm install --global pm2-windows-startup
pm2-startup install
pm2 save
```

Setelah server restart, periksa aplikasi:

```powershell
pm2 status
pm2 logs fms-frontend --lines 50
```

Aplikasi harus kembali berstatus `online`.

### Perintah PM2 penting

```powershell
pm2 status
pm2 logs fms-frontend
pm2 restart fms-frontend
pm2 stop fms-frontend
pm2 save
```

## Ringkasan Urutan Release

```text
Laptop:
  ubah kode → lint → build → commit → pull origin main → push origin main

Server:
  pull origin main → npm ci → npm run build → pm2 restart → pm2 save
```
