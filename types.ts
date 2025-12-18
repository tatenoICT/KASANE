
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
  remindersSent?: string[]; // '1day' or 'overdue'
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
