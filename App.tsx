
import React, { useState, useEffect, useMemo } from 'react';
import { CategoryType, Device, LendingRecord, HistoryLog, ActionType, Staff } from './types';
import { INITIAL_DEVICES, STAFF_DIRECTORY } from './constants';
import Header from './components/Header';
import CategoryGrid from './components/CategoryGrid';
import LendingModal from './components/LendingModal';
import EditReturnDateModal from './components/EditReturnDateModal';
import AdminDashboard from './components/AdminDashboard';
import LoginScreen from './components/LoginScreen';
import { isOneBusinessDayBefore, isOneBusinessDayAfter, isOverdue, isOneWeekOverdue } from './utils/dateUtils';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingDateDevice, setEditingDateDevice] = useState<Device | null>(null);
  const [lendingRecords, setLendingRecords] = useState<LendingRecord[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<Staff | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data from localStorage
  useEffect(() => {
    const savedDevices = localStorage.getItem('kasane_devices');
    const savedRecords = localStorage.getItem('kasane_records');
    const savedLogs = localStorage.getItem('kasane_history_logs');
    const savedIsAdmin = localStorage.getItem('kasane_is_admin');
    const savedUser = localStorage.getItem('kasane_logged_user');
    
    if (savedDevices) setDevices(JSON.parse(savedDevices));
    if (savedRecords) setLendingRecords(JSON.parse(savedRecords));
    if (savedLogs) setHistoryLogs(JSON.parse(savedLogs));
    if (savedIsAdmin === 'true') setIsAdmin(true);
    if (savedUser) setLoggedInUser(JSON.parse(savedUser));
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('kasane_devices', JSON.stringify(devices));
    localStorage.setItem('kasane_records', JSON.stringify(lendingRecords));
    localStorage.setItem('kasane_history_logs', JSON.stringify(historyLogs));
    localStorage.setItem('kasane_is_admin', isAdmin.toString());
    localStorage.setItem('kasane_logged_user', JSON.stringify(loggedInUser));
  }, [devices, lendingRecords, historyLogs, isAdmin, loggedInUser, isInitialized]);

  const handleLogout = () => {
    setIsAdmin(false);
    setLoggedInUser(null);
    setSelectedCategory(null);
  };

  const addHistoryLog = (deviceId: string, deviceNumber: string, actionType: ActionType, userName: string, employeeId: string, details?: string) => {
    const newLog: HistoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      deviceId,
      deviceNumber,
      actionType,
      userName,
      employeeId,
      timestamp: Date.now(),
      details
    };
    setHistoryLogs(prev => [...prev, newLog]);
  };

  /**
   * 通知管理ロジック
   */
  useEffect(() => {
    const checkAndSendReminders = () => {
      let updated = false;
      const newRecords = lendingRecords.map(record => {
        if (record.status !== 'active') return record;

        const sent = record.remindersSent || [];
        const is1DayBefore = isOneBusinessDayBefore(record.expectedReturnDate);
        const is1DayAfter = isOneBusinessDayAfter(record.expectedReturnDate);

        let type: '1day_before' | '1day_after' | null = null;
        
        if (is1DayBefore && !sent.includes('1day_before')) {
          type = '1day_before';
        } else if (is1DayAfter && !sent.includes('1day_after')) {
          type = '1day_after';
        }

        if (type) {
          const staff = STAFF_DIRECTORY.find(s => s.id === record.employeeId);
          const email = staff?.email || record.userEmail;
          
          let subject = '';
          let body = '';
          
          if (type === '1day_before') {
            subject = '【KASANE】返却予定日の1営業日前リマインド';
            body = `お疲れ様です。\nICTです。\n\n返却予定日の1営前となりました。\n返却予定日に返せるよう端末と充電器の確認をしてください。\nまた、ログインした場合は必ずログアウトを行い、ダウンロードしたアプリなどは必ず削除してください。\n※なお返却予定日を延長される場合は返却予定日の変更を行ってください。`;
          } else if (type === '1day_after') {
            subject = '【KASANE】至急：返却期限超過のお知らせ（1営業日経過）';
            body = `お疲れ様です。\nICTです。\n\n返却予定日を1営業日過ぎおります。\nこの後も利用される方が控えておりますので必ず本日中に返却願います。\nなお返却が難しい場合は返却予定日を返却可能な日付に変更してください。`;
          }
          
          // シミュレーション: ブラウザコンソールへ送信ログを出力
          console.group(`%c[Email Sent: ${type}]`, "color: #4f46e5; font-weight: bold; background: #e0e7ff; padding: 2px 4px; border-radius: 4px;");
          console.log(`To: ${record.userName} <${email}>`);
          console.log(`Subject: ${subject}`);
          console.log(`Message:\n${body}`);
          console.groupEnd();
          
          updated = true;
          return { ...record, remindersSent: [...sent, type] };
        }
        return record;
      });

      if (updated) {
        setLendingRecords(newRecords);
      }
    };

    const timer = setTimeout(checkAndSendReminders, 2000);
    return () => clearTimeout(timer);
  }, [lendingRecords]);

  const filteredDevices = useMemo(() => {
    if (!selectedCategory) return [];
    return devices.filter(d => d.category === selectedCategory);
  }, [selectedCategory, devices]);

  const deviceCounts = useMemo(() => {
    const total = filteredDevices.length;
    const available = filteredDevices.filter(d => d.status === 'available').length;
    return { total, available };
  }, [filteredDevices]);

  const handleRequestUse = (device: Device) => {
    if (device.status !== 'available') return;
    setSelectedDevice(device);
  };

  const handleUpdateReturnDate = (deviceId: string, newDate: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const oldDate = device.returnDate;

    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, returnDate: newDate } : d));
    
    setLendingRecords(prev => {
      const newRecords = [...prev];
      const recordIndex = [...newRecords].reverse().findIndex(r => r.deviceId === deviceId && r.status === 'active');
      if (recordIndex !== -1) {
        const actualIndex = newRecords.length - 1 - recordIndex;
        newRecords[actualIndex] = { 
          ...newRecords[actualIndex], 
          expectedReturnDate: newDate,
          remindersSent: [] // 日付が更新されたら通知履歴をリセット
        };
      }
      return newRecords;
    });

    addHistoryLog(
      deviceId, 
      device.deviceNumber, 
      'date_change', 
      device.currentUser || '不明', 
      device.currentEmployeeId || '不明',
      `返却予定日を ${oldDate || '未設定'} から ${newDate} に変更`
    );

    setEditingDateDevice(null);
  };

  const handleReturn = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const performerName = isAdmin ? '管理者' : (loggedInUser?.name || '不明');
    const performerId = isAdmin ? 'ADMIN' : (loggedInUser?.id || '不明');

    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { ...d, status: 'returned', currentUser: undefined, currentEmployeeId: undefined, returnDate: undefined } 
        : d
    ));

    setLendingRecords(prev => {
      const newRecords = [...prev];
      const recordIndex = [...newRecords].reverse().findIndex(r => r.deviceId === deviceId && r.status === 'active');
      if (recordIndex !== -1) {
        const actualIndex = newRecords.length - 1 - recordIndex;
        newRecords[actualIndex] = { ...newRecords[actualIndex], status: 'returned' };
      }
      return newRecords;
    });

    addHistoryLog(
      deviceId, 
      device.deviceNumber, 
      'return', 
      performerName, 
      performerId
    );
  };

  const handleLendingSubmit = (data: Omit<LendingRecord, 'id' | 'timestamp' | 'status'>) => {
    if (!selectedDevice) return;

    const newRecord: LendingRecord = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      deviceId: selectedDevice.id,
      timestamp: Date.now(),
      status: 'active',
      remindersSent: [],
    };

    setLendingRecords(prev => [...prev, newRecord]);
    setDevices(prev => prev.map(d => 
      d.id === selectedDevice.id 
        ? { 
            ...d, 
            status: 'borrowed', 
            currentUser: data.userName, 
            currentEmployeeId: data.employeeId,
            returnDate: data.expectedReturnDate, 
            lendingCount: (d.lendingCount || 0) + 1 
          } 
        : d
    ));

    addHistoryLog(
      selectedDevice.id, 
      selectedDevice.deviceNumber, 
      'lending', 
      data.userName, 
      data.employeeId,
      `返却予定日: ${data.expectedReturnDate}`
    );

    setSelectedDevice(null);
  };

  const handleAddDevice = (category: CategoryType, number: string, details: { assetId?: string, phoneNumber?: string, location?: string }) => {
    const newDevice: Device = {
      id: Math.random().toString(36).substr(2, 9),
      category,
      deviceNumber: number,
      status: 'available',
      lendingCount: 0,
      ...details
    };
    setDevices(prev => [...prev, newDevice]);
  };

  const handleUpdateDevice = (id: string, details: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...details } : d));
  };

  const handleDeleteDevice = (id: string) => {
    if (confirm('この端末を削除してもよろしいですか？')) {
      setDevices(prev => prev.filter(d => d.id !== id));
    }
  };

  if (!loggedInUser && !isAdmin) {
    return <LoginScreen 
      onUserLogin={(staff) => setLoggedInUser(staff)} 
      onAdminLogin={() => setIsAdmin(true)} 
    />;
  }

  return (
    <div className="min-h-screen pb-20">
      <Header isAdmin={isAdmin} loggedInUser={loggedInUser} onLogout={handleLogout} />
      
      <main className="max-w-5xl mx-auto py-8">
        {isAdmin ? (
          <AdminDashboard 
            devices={devices}
            historyLogs={historyLogs}
            onAddDevice={handleAddDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            onBackToUser={() => setIsAdmin(false)}
          />
        ) : !selectedCategory ? (
          <>
            <div className="px-6 mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">端末カテゴリーを選択</h2>
              <p className="text-slate-500 mt-2 font-medium">利用したい端末の種類を選んでください。</p>
            </div>
            <CategoryGrid onSelect={setSelectedCategory} />
          </>
        ) : (
          <div className="px-6 animate-in slide-in-from-right duration-300">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:translate-x-[-4px] transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              戻る
            </button>
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900">{selectedCategory}</h2>
              <div className="text-right">
                <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm inline-block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">利用可能 / 登録</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-black text-indigo-600 leading-none">{deviceCounts.available}</span>
                    <span className="text-slate-300 font-bold leading-none">/</span>
                    <span className="text-lg font-bold text-slate-500 leading-none">{deviceCounts.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredDevices.map(device => (
                <div key={device.id} className={`bg-white p-6 rounded-2xl border ${device.status !== 'available' ? 'border-slate-100 opacity-80' : 'border-slate-200 shadow-sm'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${device.status === 'available' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {selectedCategory === 'Wi-Fi' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>}
                        {selectedCategory === 'iPad' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>}
                        {selectedCategory === 'iPhone' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2zM10 5h4"></path>}
                        {selectedCategory === 'PC' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2m16 0h-16"></path>}
                        {selectedCategory === 'その他周辺機器' && (
                          <g>
                            <rect x="7" y="2" width="10" height="20" rx="5" strokeWidth="2" />
                            <path d="M12 2v7M7 9h10" strokeWidth="2" />
                          </g>
                        )}
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-slate-800">{device.deviceNumber}</h4>
                        {device.location && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                            {device.location}
                          </span>
                        )}
                      </div>
                      {device.status === 'borrowed' && (
                        <div className="flex flex-col mt-1">
                          <span className="text-sm text-slate-500 font-bold">{device.currentUser}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-rose-500 font-bold uppercase tracking-wide">返却予定: {device.returnDate}</span>
                            <button 
                              onClick={() => setEditingDateDevice(device)}
                              className="text-slate-300 hover:text-indigo-500 transition-colors p-0.5"
                              title="返却予定日を編集"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {device.status === 'returned' && (
                        <span className="text-sm text-amber-600 font-bold uppercase mt-1 inline-block">返却済み (点検中)</span>
                      )}
                      {device.status === 'available' && (
                        <span className="text-sm text-green-600 font-bold uppercase mt-1 inline-block">利用可能</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto">
                    {device.status === 'available' ? (
                      <button
                        onClick={() => handleRequestUse(device)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
                      >
                        利用申請
                      </button>
                    ) : device.status === 'borrowed' ? (
                      <button
                        onClick={() => handleReturn(device.id)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl transition-all"
                      >
                        返却済み
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-50 text-slate-400 border border-slate-200 font-bold rounded-xl transition-all cursor-not-allowed"
                      >
                        点検中
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {selectedDevice && (
        <LendingModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onSubmit={handleLendingSubmit}
        />
      )}

      {editingDateDevice && (
        <EditReturnDateModal
          device={editingDateDevice}
          onClose={() => setEditingDateDevice(null)}
          onSave={(newDate) => handleUpdateReturnDate(editingDateDevice.id, newDate)}
        />
      )}
    </div>
  );
};

export default App;
