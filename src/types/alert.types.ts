export type AlertType =
  | 'Overspeed'
  | 'Underspeed'
  | 'Offtrack'
  | 'Fuel Decrease'
  | 'Fuel Increase';

export interface Alert {
  id: string
  equipment_id: string;
  equipments?: {
    equipment_code?: string
  }
  log_id: string;
  alert_category_id: number;
  alert_categories?: {
    alert_category_name?: string
  }
  latitude: number;
  longitude: number;
  is_inside: boolean;
  orig_fid: number;
  location_category: string;
  segment: string;
  speed: number;
  fuel_level: number;
  vessel: string;
  millege: number;
  vessel_status: string;
  engine_status: boolean;
  status: AlertType;
  created_at: string;
  resolved_at: string ;
  is_read: boolean;
  shift: string;
  metadata: Record<string, unknown>
}

export interface AlertSummaryByCategoryParams {
  created_at?: string
  created_at_end?: string
  search?: string
}
export interface AlertCategorySummary {
  alert_category_name: string
  equipment_code: string
  alert_count: number
  duration: string
}

// export interface AlertRule {
//   id: string
//   name: string
//   type: AlertType
//   vehicleId: string
//   isActive: boolean
//   threshold: AlertThreshold
//   notifyEmail: boolean
//   notifyInApp: boolean
//   createdAt: string
// }

// export interface AlertThreshold {
//   maxSpeed?: number           
//   maxIdleMinutes?: number     
//   minFuelPercent?: number     
//   geofenceId?: string         
// }
