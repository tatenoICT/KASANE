
import React, { useState, useEffect, useMemo } from 'react';
import { CategoryType, Device, LendingRecord } from './types';
import { INITIAL_DEVICES, STAFF_DIRECTORY } from './constants';
import Header from './components/Header';
import CategoryGrid from './components/CategoryGrid';
import LendingModal from './components/LendingModal';
import AdminDashboard from './components/AdminDashboard';
import { generateStatusInsight } from './services/geminiService';
import { isOneBusinessDayBefore, isOverdue } from './utils/dateUtils';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [lendingRecords, setLendingRecords] = useState<LendingRecord[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize records from localStorage if possible
  useEffect(() => {
    const savedDevices = localStorage.getItem('kasane_devices');
    const savedRecords = localStorage.getItem('kasane_records');
    const savedIsAdmin = localStorage.getItem('kasane_is_admin');
    
    if (savedDevices) setDevices(JSON.parse(savedDevices));
    if (savedRecords) setLendingRecords(JSON.parse(savedRecords));
    if (savedIsAdmin === 'true') setIsAdmin(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('kasane_devices', JSON.stringify(devices));
    localStorage.setItem('kasane_records', JSON.stringify(lendingRecords));
    localStorage.setItem('kasane_is_admin', isAdmin.toString());
  }, [devices, lendingRecords, isAdmin]);

  // Automatic Overdue & Remind Checker
  useEffect(() => {
    const checkAndSendReminders = () => {
      let updated = false;
      const newRecords = lendingRecords.map(record => {
        if (record.status !== 'active') return record;

        const isOverdueItem = isOverdue(record.expectedReturnDate);
        const isOneDayBefore = isOneBusinessDayBefore(record.expectedReturnDate);
        const sent = record.remindersSent || [];

        let type: 'overdue' | '1day' | null = null;
        if (isOverdueItem && !sent.includes('overdue')) {
          type = 'overdue';
        } else if (isOneDayBefore && !sent.includes('1day')) {
          type = '1day';
        }

        if (type) {
          // Extract email from staff directory using employee ID
          const staff = STAFF_DIRECTORY.find(s => s.id === record.employeeId);
          const email = staff?.email || record.userEmail;
          const subject = type === 'overdue' ? '【KASANE】至急：端末返却期限超過のお知らせ' : '【KASANE】リマインド：明日、端末の返却期限です';
          
          console.log(`[Automatic Email Sent] To: ${email} (${record.userName}), Subject: ${subject}`);
          
          // In a real app, you'd call an API here.
          // For this simulation, we'll notify the UI once.
          updated = true;
          return { ...record, remindersSent: [...sent, type] };
        }
        return record;
      });

      if (updated) {
        setLendingRecords(newRecords);
      }
    };

    // Run check on mount and whenever records change
    const timer = setTimeout(checkAndSendReminders, 2000);
    return () => clearTimeout(timer);
  }, [lendingRecords]);

  // Generate AI Insight
  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const insight = await generateStatusInsight(devices);
      setAiInsight(insight);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [devices.length]);

  const filteredDevices = useMemo(() => {
    if (!selectedCategory) return [];
    return devices.filter(d => d.category === selectedCategory);
  }, [selectedCategory, devices]);

  const handleRequestUse = (device: Device) => {
    if (device.status !== 'available') return;
    setSelectedDevice(device);
  };

  const handleReturn = (deviceId: string) => {
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
    setSelectedDevice(null);
  };

  // Admin Actions
  const handleToggleAdmin = () => {
    setIsAdmin(!isAdmin);
    setSelectedCategory(null);
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

  return (
    <div className="min-h-screen pb-20">
      <Header onAdminToggle={handleToggleAdmin} isAdmin={isAdmin} />
      
      <main className="max-w-5xl mx-auto py-8">
        {isAdmin ? (
          <AdminDashboard 
            devices={devices}
            records={lendingRecords}
            onAddDevice={handleAddDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            onBackToUser={() => setIsAdmin(false)}
          />
        ) : !selectedCategory ? (
          <>
            <div className="px-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-3xl shadow-sm mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg mt-1 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">AI Status Insight</h2>
                    <p className="text-slate-600 leading-relaxed mt-1">
                      {loadingInsight ? '分析中...' : aiInsight}
                    </p>
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">端末カテゴリーを選択</h2>
              <p className="text-slate-500 mt-2">利用したい端末の種類を選んでください。</p>
            </div>
            <CategoryGrid onSelect={setSelectedCategory} />
          </>
        ) : (
          <div className="px-6 animate-in slide-in-from-right duration-300">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:translate-x-[-4px] transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              戻る
            </button>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{selectedCategory}</h2>
                <p className="text-slate-500 mt-1">{filteredDevices.length} 台の端末が登録されています</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredDevices.map(device => (
                <div key={device.id} className={`bg-white p-6 rounded-2xl border ${device.status !== 'available' ? 'border-slate-100 opacity-80' : 'border-slate-200 shadow-sm'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${device.status === 'available' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {selectedCategory === 'Wi-Fi' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>}
                        {selectedCategory === 'iPad' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>}
                        {selectedCategory === 'iPhone' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 5h6"></path>}
                        {selectedCategory === 'PC' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>}
                        {selectedCategory === 'その他周辺機器' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>}
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
                          <span className="text-xs text-rose-500 font-semibold uppercase mt-0.5">返却予定: {device.returnDate}</span>
                        </div>
                      )}
                      {device.status === 'returned' && (
                        <span className="text-sm text-amber-600 font-semibold uppercase mt-1 inline-block">返却済み (点検中)</span>
                      )}
                      {device.status === 'available' && (
                        <span className="text-sm text-green-600 font-semibold uppercase mt-1 inline-block">利用可能</span>
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
    </div>
  );
};

export default App;
