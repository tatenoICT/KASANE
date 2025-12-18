
import { Device, Staff } from './types';

export const STAFF_DIRECTORY: Staff[] = [
  { id: '3738', name: '立野 春華', email: 'h.tateno@amana.jp' },
  { id: '1001', name: '山田 太郎', email: 't.yamada@example.com' },
  { id: '1002', name: '佐藤 花子', email: 'h.sato@example.com' },
  { id: '2020', name: '鈴木 一郎', email: 'i.suzuki@example.com' },
];

export const INITIAL_DEVICES: Device[] = [
  { 
    id: 'wifi-01', 
    category: 'Wi-Fi', 
    deviceNumber: 'WIFI-001', 
    status: 'available',
    lendingCount: 12,
    assetId: 'NW-001',
    phoneNumber: '070-1234-5678',
    location: '貸出ロッカー A-1'
  },
  { 
    id: 'wifi-02', 
    category: 'Wi-Fi', 
    deviceNumber: 'WIFI-002', 
    status: 'borrowed', 
    lendingCount: 45,
    currentUser: '立野 春華', 
    currentEmployeeId: '3738',
    returnDate: '2023-12-01',
    assetId: 'NW-002',
    phoneNumber: '070-9876-5432',
    location: '貸出ロッカー A-2'
  },
  { 
    id: 'ipad-01', 
    category: 'iPad', 
    deviceNumber: 'IPAD-001', 
    status: 'available',
    lendingCount: 8,
    assetId: 'TAB-001',
    location: 'ロッカー03'
  },
  { 
    id: 'pc-01', 
    category: 'PC', 
    deviceNumber: 'PC-001', 
    status: 'available',
    lendingCount: 15,
    assetId: 'PC-001',
    location: '貸出ロッカー C-1'
  },
];

export const CATEGORIES = ['Wi-Fi', 'iPad', 'iPhone', 'PC', 'その他周辺機器'] as const;
