# Socket.IO Integration - Tracking Page

## Overview
Implementasi real-time updates menggunakan Socket.IO untuk halaman tracking. Menggantikan polling mechanism dengan event-driven updates.

## Files
- `useSocketTracking.ts` - Hook untuk mengelola koneksi Socket.IO dan event handlers
- `TrackingPage.tsx` - Komponen yang menggunakan socket hook

## Socket Events

### 1. `equipment-status-update`
Update posisi dan status equipment secara real-time.

**Data Structure:**
```typescript
{
  equipment_id: string
  log_id: string
  equipment_code: string
  equipment_alias: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  fuel_level: number
  fuel_volume: number
  status: 'OFFLINE' | 'IDLE' | 'MOVING'
  engine_status: boolean
  recorded_at: string
  // ... other fields
}
```

**Action:** Update `equipment-status.store` dengan `setPosition()`

### 2. `new-alert`
Notifikasi alert baru (overspeed, underspeed, off-track, fuel decrease).

**Data Structure:**
```typescript
{
  id: string
  equipment_id: string
  equipment_code: string
  alert_category_id: number
  status: 'Overspeed' | 'Underspeed' | 'Offtrack' | 'Fuel Decrease'
  latitude: number
  longitude: number
  speed: number
  created_at: string
  // ... other fields
}
```

**Action:** Add alert ke `alert.store` dengan `addAlert()`

### 3. `new-equipment-log`
Log aktivitas equipment.

**Data Structure:**
```typescript
{
  log_id: string
  equipment_id: string
  equipment_code: string
  event_type: string
  timestamp: string
  details: Record<string, unknown>
}
```

**Action:** Console log (bisa dikembangkan untuk notification)

### 4. `fuel-event`
Event terkait fuel (refuel, drain, low fuel).

**Data Structure:**
```typescript
{
  equipment_id: string
  equipment_code: string
  event_type: 'refuel' | 'drain' | 'low'
  fuel_before: number
  fuel_after: number
  fuel_change: number
  timestamp: string
  location?: { latitude: number, longitude: number }
}
```

**Action:** Console log dengan warning untuk low fuel

### 5. `geofence-event`
Event geofence (enter/exit).

**Data Structure:**
```typescript
{
  equipment_id: string
  equipment_code: string
  geofence_id: string
  geofence_name: string
  event_type: 'enter' | 'exit'
  timestamp: string
  location: { latitude: number, longitude: number }
}
```

**Action:** Console log dengan warning untuk exit event

## Console Output

Setiap event menghasilkan console log dengan emoji untuk mudah dibaca:

- 🔌 Connection events
- ✅ Connected
- ❌ Disconnected
- 🔄 Reconnecting
- 📍 Equipment status update
- 🚨 New alert
- 📝 Equipment log
- ⛽ Fuel event
- 🗺️ Geofence event

## Configuration

Socket URL dikonfigurasi di `useSocketTracking.ts`:
```typescript
const SOCKET_URL = 'http://localhost:3346'
```

Update URL sesuai dengan backend server Anda.

## Usage in TrackingPage

```typescript
import useSocketTracking from './hooks/useSocketTracking'

const TrackingPage = () => {
  // Aktifkan socket connection
  useSocketTracking()
  
  // ... rest of component
}
```

## Store Integration

### Equipment Status Store
- `setPosition(equipment)` - Update single equipment
- `setBulkPositions(list)` - Update multiple equipment (initial load)
- `setConnected(boolean)` - Update connection status

### Alert Store
- `addAlert(alert)` - Tambah alert baru ke list
- Store akan otomatis maintain max 100 alerts
- Unread count akan bertambah otomatis

## Connection Management

Hook secara otomatis menangani:
- ✅ Initial connection
- ✅ Auto-reconnect dengan exponential backoff
- ✅ Cleanup on unmount
- ✅ Connection status tracking
- ✅ Error handling

## Development Notes

1. **Polling Fallback**: Polling mechanism (`useEquipmentStatusLive`) sudah di-comment. Uncomment jika ingin hybrid approach (polling + socket).

2. **Testing**: Buka browser console untuk melihat semua socket events secara real-time.

3. **Production**: Update `SOCKET_URL` ke production URL sebelum deploy.

4. **Performance**: Socket.IO lebih efisien daripada polling karena:
   - Hanya mengirim data saat ada perubahan
   - Bi-directional communication
   - Automatic reconnection
   - Binary data support

## Troubleshooting

### Connection Failed
- Pastikan backend Socket.IO server running di port 3346
- Check CORS configuration di backend
- Check network/firewall settings

### No Updates
- Check console untuk connection status
- Verify backend emit event dengan nama yang benar
- Check data structure match dengan TypeScript interface

### Memory Leaks
- Hook sudah handle cleanup dengan proper `socket.off()` dan `socket.disconnect()`
- Alert store limit 100 items untuk prevent memory issues

## Next Steps

1. ✅ Socket integration dengan console logging
2. 🔄 Map auto-update saat terima equipment-status-update
3. 🔄 Alert panel auto-update saat terima new-alert
4. 🔜 Toast notification untuk critical alerts
5. 🔜 Sound notification untuk geofence events
6. 🔜 Real-time analytics dashboard
