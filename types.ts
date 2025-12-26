
export type CategoryType = 'Wi-Fi' | 'iPad' | 'iPhone' | 'PC' | 'その他周辺機器';

export type DeviceStatus = 'available' | 'borrowed' | 'returned';

export interface Device {
  id: string;
  category: CategoryType;
  deviceNumber: string;
  status: DeviceStatus;
  lendingCount: number;
  currentUser?: string;
  currentEmployeeId?: string;
  returnDate?: string;
  assetId?: string;
  phoneNumber?: string;
  location?: string;
}

export type ActionType = 'lending' | 'return' | 'date_change';

export interface HistoryLog {
  id: string;
  deviceId: string;
  deviceNumber: string;
  actionType: ActionType;
  userName: string;
  employeeId: string;
  timestamp: number;
  details?: string; // 例: "返却予定日を 2023-12-01 から 2023-12-05 に変更"
}

export interface LendingRecord {
  id: string;
  deviceId: string;
  userName: string;
  employeeId: string;
  userEmail: string;
  startDate: string;
  expectedReturnDate: string;
  reason: string;
  timestamp: number;
  status: 'active' | 'returned';
  remindersSent?: string[]; // '1day', 'overdue', 'warning'
}

export interface Staff {
  id: string;
  name: string;
  email: string;
}

export interface AIAnalysis {
  sentiment: string;
  urgency: 'high' | 'normal' | 'low';
  summary: string;
}
