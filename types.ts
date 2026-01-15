
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

export type ActionType = 'lending' | 'return' | 'date_change' | 'inspection_complete' | 'reminder_sent';

export interface HistoryLog {
  id: string;
  deviceId: string;
  deviceNumber: string;
  actionType: ActionType;
  userName: string;
  employeeId: string;
  timestamp: number;
  details?: string;
}

// Added EmailPayload interface for reminder system
export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  type: '1day_before' | '1day_after';
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
  // Added to track which reminder emails have been sent
  remindersSent: ('1day_before' | '1day_after')[];
}

export interface Staff {
  id: string;
  name: string;
  email: string;
}
