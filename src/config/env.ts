// src/config/env.ts
const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  socketUrl: import.meta.env.VITE_SOCKET_URL as string,
  realtimeMode: import.meta.env.VITE_REALTIME_MODE as 'polling' | 'socket',
  appName: import.meta.env.VITE_APP_NAME as string,
} as const

export default env