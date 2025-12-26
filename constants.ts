
import { Device, Staff } from './types';

export const STAFF_DIRECTORY: Staff[] = [
  { id: '3669', name: '辻 大輔', email: 'd.tsuji@amana.jp' },
  { id: '3700', name: '齋藤 航輝', email: 'kaz.saito@amana.jp' },
  { id: '3738', name: '立野 春華', email: 'h.tateno@amana.jp' },
  { id: '2342', name: '橋間 司', email: 't.hashima@amana.jp' },
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
    id: 'iphone-01', 
    category: 'iPhone', 
    deviceNumber: 'IPHONE-001', 
    status: 'available',
    lendingCount: 0,
    assetId: 'PH-001',
    location: '貸出ロッカー B-1'
  },
  { 
    id: 'iphone-02', 
    category: 'iPhone', 
    deviceNumber: 'IPHONE-002', 
    status: 'available',
    lendingCount: 0,
    assetId: 'PH-002',
    location: '貸出ロッカー B-2'
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
  { 
    id: 'monitor-01', 
    category: 'その他周辺機器', 
    deviceNumber: 'モニター-01', 
    status: 'available',
    lendingCount: 0,
    assetId: 'MON-001',
    location: '周辺機器棚 A-1'
  },
  { 
    id: 'keyboard-01', 
    category: 'その他周辺機器', 
    deviceNumber: 'キーボード-01', 
    status: 'available',
    lendingCount: 0,
    assetId: 'KEY-001',
    location: '周辺機器棚 A-2'
  },
];

export const CATEGORIES = ['Wi-Fi', 'iPad', 'iPhone', 'PC', 'その他周辺機器'] as const;
