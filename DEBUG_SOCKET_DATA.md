# 🔍 Debug: Socket.IO Data Tidak Muncul di Maps & Equipment List

## 🐛 Issue
Maps, Equipment List, dan Equipment Status belum menampilkan data meskipun Socket.IO sudah connect.

## 🔧 Debug Steps yang Sudah Ditambahkan

### 1. Debug di useSocketTracking
Tambahan console log untuk trace data flow:
```typescript
📥 Fetching initial equipment data...
📥 Raw API response: {...}
📥 Extracted list: [...]
📥 List length: X
✅ Initial data loaded: X equipments
✅ Store positions after set: {...}
```

### 2. Debug di TrackingPage
Tambahan console log untuk cek data di component:
```typescript
[TrackingPage] positionsMap: {...}
[TrackingPage] equipments count: X
[TrackingPage] equipments: [...]
```

---

## 📋 Checklist Troubleshooting

### Step 1: Buka Browser Console (F12)

#### ✅ Cek Socket Connection
Anda harus melihat:
```
🔌 Connecting to Socket.IO server: http://localhost:3346
✅ Socket.IO connected: <socket-id>
```

**Jika tidak muncul:**
- Socket.IO server belum running
- URL salah di `.env` atau `socket.ts`

#### ✅ Cek Initial Data Fetch
Anda harus melihat:
```
📥 Fetching initial equipment data...
📥 Raw API response: {...}
📥 Extracted list: [array dengan data]
📥 List length: 15 (atau jumlah equipment Anda)
✅ Initial data loaded: 15 equipments
✅ Store positions after set: {equipment_id: {...}, ...}
```

**Jika tidak muncul atau error:**
- REST API `/fms/api/equipment-status/live` tidak responding
- Authentication issue
- Network error

#### ✅ Cek Data di Component
Anda harus melihat:
```
[TrackingPage] positionsMap: {equipment_id: {...}, ...}
[TrackingPage] equipments count: 15
[TrackingPage] equipments: [{equipment_id: ..., latitude: ..., longitude: ...}, ...]
```

**Jika positionsMap kosong `{}`:**
- Store tidak menerima data
- setBulkPositions tidak jalan
- Data structure tidak match

---

## 🔍 Common Issues & Solutions

### Issue 1: Socket Connect tapi Tidak Fetch Data
**Symptom:**
```
✅ Socket.IO connected: abc123
// Tidak ada log "📥 Fetching initial equipment data..."
```

**Cause:** `fetchInitialData()` tidak dipanggil

**Solution:** Sudah fixed, pastikan kode terbaru sudah di-load (hard refresh: Ctrl+Shift+R)

---

### Issue 2: API Response Structure Berbeda
**Symptom:**
```
📥 Raw API response: {...}
📥 Extracted list: []  // <-- KOSONG
📥 List length: 0
```

**Cause:** Response structure tidak match dengan `extractList()`

**Solution:** Lihat "Raw API response" di console, paste structure-nya, dan saya akan fix `extractList()`

**Expected API Response:**
```typescript
// Format 1
{
  data: [
    { equipment_id: "...", latitude: ..., ... },
    { equipment_id: "...", latitude: ..., ... }
  ]
}

// Format 2
{
  data: {
    data: [
      { equipment_id: "...", latitude: ..., ... },
      { equipment_id: "...", latitude: ..., ... }
    ]
  }
}
```

---

### Issue 3: Store Tidak Update
**Symptom:**
```
✅ Initial data loaded: 15 equipments
✅ Store positions after set: {}  // <-- KOSONG
```

**Cause:** Store setter tidak berfungsi

**Solution:** Cek Zustand store implementation, pastikan `setBulkPositions` benar

---

### Issue 4: Component Tidak Re-render
**Symptom:**
```
✅ Store positions after set: {equipment_id: {...}, ...}  // <-- ADA DATA
[TrackingPage] positionsMap: {}  // <-- TAPI DI COMPONENT KOSONG
```

**Cause:** Component tidak subscribe ke store dengan benar

**Solution:** Cek selector `selectPositions` di TrackingPage

---

## 🎯 Action Items

### 1. Refresh Browser (Hard Refresh)
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2. Buka Console dan Screenshot
Ambil screenshot dari console log yang muncul dan kirim ke saya:
- Log Socket connection
- Log Initial data fetch
- Log TrackingPage data
- Any errors (merah)

### 3. Cek Network Tab
Buka Network tab di DevTools:
- Filter: `/equipment-status/live`
- Lihat response dari API
- Screenshot response body

### 4. Paste Console Output
Copy semua log yang muncul mulai dari:
```
🔌 Connecting to Socket.IO server...
```
sampai
```
[TrackingPage] equipments: [...]
```

Dan paste ke chat ini.

---

## 📝 Expected Console Output (Success Case)

```
🔌 Connecting to Socket.IO server: http://localhost:3346
✅ Socket.IO connected: abc123xyz
📥 Fetching initial equipment data...
📥 Raw API response: {data: Array(15)}
📥 Extracted list: [{equipment_id: "eq-001", ...}, ...]
📥 List length: 15
✅ Initial data loaded: 15 equipments
✅ Store positions after set: {eq-001: {...}, eq-002: {...}, ...}
[TrackingPage] positionsMap: {eq-001: {...}, eq-002: {...}, ...}
[TrackingPage] equipments count: 15
[TrackingPage] equipments: [{equipment_id: "eq-001", latitude: -6.2088, ...}, ...]
```

Jika output Anda seperti ini, berarti **data sudah masuk** dan harusnya tampil di map!

---

## 🔄 Next: Alert Real-time

Setelah equipment data muncul, kita akan implement alert real-time:

1. ✅ Socket emit `new-alert`
2. ✅ Check tanggal alert = selectedDate
3. ✅ Refetch alert summary
4. ✅ Update panel

---

**Status:** 🔍 Debugging Mode  
**Action:** Silakan buka console dan paste output-nya
