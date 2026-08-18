// Socket.IO Configuration
export const SOCKET_CONFIG = {
  // Socket server URL
  url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3346',
  
  // Socket connection options
  options: {
    transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 10000,
  },
  
  // Event names
  events: {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',
    
    // Data events
    EQUIPMENT_STATUS_UPDATE: 'equipment-status-update',
    NEW_ALERT: 'new-alert',
    ALERT_SUMMARY_UPDATE: 'alert-summary-update',
    NEW_EQUIPMENT_LOG: 'new-equipment-log',
    FUEL_EVENT: 'fuel-event',
    GEOFENCE_EVENT: 'geofence-event',
  } as const,
}

export type SocketEventName = typeof SOCKET_CONFIG.events[keyof typeof SOCKET_CONFIG.events]
