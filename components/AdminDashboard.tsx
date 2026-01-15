
import React, { useState, useMemo } from 'react';
import { Device, HistoryLog, CategoryType, ActionType, LendingRecord } from '../types';
import { CATEGORIES } from '../constants';

interface AdminDashboardProps {
  devices: Device[];
  historyLogs: HistoryLog[];
  lendingRecords: LendingRecord[];
  onAddDevice: (category: CategoryType, number: string, details: { assetId?: string, phoneNumber?: string, location?: string }) => void;
  onUpdateDevice: (id: string, details: Partial<Device>) => void;
  onDeleteDevice: (id: string) => void;
  onBackToUser: () => void;
  onCompleteInspection: (deviceId: string) => void;
  onRunReminders: () => Promise<number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Wi-Fi': '#3b82f6',
  'iPhone': '#f43f5e',
  'iPad': '#6366f1',
  'PC': '#334155',
  'その他周辺機器': '#14b8a6'
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Wi-Fi': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>,
  'iPhone': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2zM10 5h4"></path></svg>,
  'iPad': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
  'PC': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2m16 0h-16"></path></svg>,
  'その他周辺機器': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="7" y="2" width="10" height="20" rx="5" strokeWidth="2" />
      <path d="M12 2v7M7 9h10" strokeWidth="2" />
    </svg>
  )
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  devices, 
  historyLogs, 
  lendingRecords,
  onAddDevice, 
  onUpdateDevice,
  onDeleteDevice, 
  onBackToUser,
  onCompleteInspection,
  onRunReminders
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'manage' | 'history' | 'reminders'>('status');
  const [historyFilter, setHistoryFilter] = useState<'all' | ActionType>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newDeviceCategory, setNewDeviceCategory] = useState<CategoryType>('Wi-Fi');
  const [newDeviceNumber, setNewDeviceNumber] = useState('');

  const stats = useMemo(() => {
    const total = devices.length;
    const borrowedDevices = devices.filter(d => d.status === 'borrowed');
    const borrowedTotal = borrowedDevices.length;
    const returnedCount = devices.filter(d => d.status === 'returned').length;
    const available = devices.filter(d => d.status === 'available').length;
    
    const borrowedBreakdown = CATEGORIES.map(cat => ({
      label: cat,
      value: borrowedDevices.filter(d => d.category === cat).length,
      color: CATEGORY_COLORS[cat]
    }));

    return { total, borrowedTotal, returnedCount, available, borrowedBreakdown };
  }, [devices]);

  const filteredLogs = useMemo(() => {
    let base = [...historyLogs].reverse();
    if (historyFilter === 'all') return base;
    return base.filter(log => log.actionType === historyFilter);
  }, [historyLogs, historyFilter]);

  const activeLendings = useMemo(() => {
    return lendingRecords.filter(r => r.status === 'active');
  }, [lendingRecords]);

  const handleRunBatch = async () => {
    setIsProcessing(true);
    const count = await onRunReminders();
    window.alert(`${count}件のリマインドを送信または更新しました。`);
    setIsProcessing(false);
  };

  const getActionBadge = (type: ActionType) => {
    switch (type) {
      case 'lending': return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">利用申請</span>;
      case 'return': return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">返却済み</span>;
      case 'date_change': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">予定変更</span>;
      case 'inspection_complete': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">点検完了</span>;
      case 'reminder_sent': return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">リマインド</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">ダッシュボード</h2>
        </div>
        <button onClick={onBackToUser} className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-100">利用者画面へ戻る</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['status', 'manage', 'history', 'reminders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'status' ? '在庫状況' : tab === 'manage' ? '端末管理' : tab === 'history' ? '履歴' : 'リマインド管理'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
        {activeTab === 'status' && (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">カテゴリー</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">端末番号</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状態</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">利用者</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {devices.map(device => (
                <tr key={device.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-600">{device.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{device.deviceNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${device.status === 'available' ? 'bg-green-100 text-green-700' : device.status === 'returned' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{device.status === 'available' ? '利用可能' : device.status === 'returned' ? '点検中' : '貸出中'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{device.currentUser || "-"}</td>
                  <td className="px-6 py-4">
                    {device.status === 'returned' && <button onClick={() => onCompleteInspection(device.id)} className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-1.5 px-3 rounded-lg shadow-sm">点検完了</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'reminders' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-bold text-slate-900">リマインド一括チェック</h4>
                <p className="text-sm text-slate-500 mt-1">返却予定日の1営業日前/後に基づき、メール送信をチェックします。</p>
              </div>
              <button 
                onClick={handleRunBatch}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>実行中</> : 'リマインド実行'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">利用者</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">返却予定日</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">1日前送信</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">1日後送信</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeLendings.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{record.userName}</div>
                        <div className="text-[10px] text-slate-400">{record.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-rose-500">{record.expectedReturnDate}</td>
                      <td className="px-6 py-4">
                        {record.remindersSent.includes('1day_before') ? (
                          <span className="text-green-600 flex items-center gap-1 font-bold text-xs"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>完了</span>
                        ) : <span className="text-slate-300 text-xs">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {record.remindersSent.includes('1day_after') ? (
                          <span className="text-rose-600 flex items-center gap-1 font-bold text-xs"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>超過通知済</span>
                        ) : <span className="text-slate-300 text-xs">-</span>}
                      </td>
                    </tr>
                  ))}
                  {activeLendings.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">現在、貸出中の端末はありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">日時</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">対象</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">社員</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4"><div className="flex flex-col"><span className="text-sm font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</span><span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div></td>
                    <td className="px-6 py-4">{getActionBadge(log.actionType)}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-black">{log.deviceNumber}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.userName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
