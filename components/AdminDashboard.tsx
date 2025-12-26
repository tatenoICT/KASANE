
import React, { useState, useMemo } from 'react';
import { Device, HistoryLog, CategoryType, ActionType } from '../types';
import { CATEGORIES } from '../constants';

interface AdminDashboardProps {
  devices: Device[];
  historyLogs: HistoryLog[];
  onAddDevice: (category: CategoryType, number: string, details: { assetId?: string, phoneNumber?: string, location?: string }) => void;
  onUpdateDevice: (id: string, details: Partial<Device>) => void;
  onDeleteDevice: (id: string) => void;
  onBackToUser: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Wi-Fi': '#3b82f6',
  'iPad': '#6366f1',
  'iPhone': '#f43f5e',
  'PC': '#334155',
  'その他周辺機器': '#14b8a6'
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Wi-Fi': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>,
  'iPad': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
  'iPhone': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2zM10 5h4"></path></svg>,
  'PC': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2m16 0h-16"></path></svg>,
  'その他周辺機器': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="7" y="2" width="10" height="20" rx="5" strokeWidth="2" />
      <path d="M12 2v7M7 9h10" strokeWidth="2" />
    </svg>
  )
};

const MultiSegmentDoughnut: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = 75; 
  const strokeWidth = 20; 
  const svgSize = 200; 
  const centerCoord = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  if (total === 0) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle cx={centerCoord} cy={centerCoord} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
        </svg>
        <span className="absolute text-sm font-bold text-slate-400">貸出なし</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          if (percentage === 0) return null;
          const strokeDasharray = (percentage / 100) * circumference;
          const offset = currentOffset;
          currentOffset += strokeDasharray;

          return (
            <circle
              key={index}
              cx={centerCoord}
              cy={centerCoord}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={-offset}
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">貸出状況</span>
        <span className="text-2xl font-black text-slate-900 leading-none mt-1">{total}</span>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  devices, 
  historyLogs, 
  onAddDevice, 
  onUpdateDevice,
  onDeleteDevice, 
  onBackToUser 
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'manage' | 'history'>('status');
  const [historyFilter, setHistoryFilter] = useState<'all' | ActionType>('all');
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  const [newDeviceCategory, setNewDeviceCategory] = useState<CategoryType>('Wi-Fi');
  const [newDeviceNumber, setNewDeviceNumber] = useState('');
  const [newAssetId, setNewAssetId] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');

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

  const handleMakeAvailable = (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation();
    onUpdateDevice(deviceId, { status: 'available' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceNumber.trim()) return;
    onAddDevice(newDeviceCategory, newDeviceNumber.trim(), {
      assetId: newAssetId.trim() || undefined,
      phoneNumber: newPhoneNumber.trim() || undefined,
      location: newDeviceLocation.trim() || undefined,
    });
    setNewDeviceNumber('');
    setNewAssetId('');
    setNewPhoneNumber('');
    setNewDeviceLocation('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    onUpdateDevice(editingDevice.id, {
      category: editingDevice.category,
      deviceNumber: editingDevice.deviceNumber,
      assetId: editingDevice.assetId,
      phoneNumber: editingDevice.phoneNumber,
      location: editingDevice.location,
    });
    setEditingDevice(null);
  };

  const getActionBadge = (type: ActionType) => {
    switch (type) {
      case 'lending':
        return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">利用申請</span>;
      case 'return':
        return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">返却済み</span>;
      case 'date_change':
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">予定変更</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
            <span>KASANE 管理者パネル</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">ダッシュボード</h2>
        </div>
        <button 
          onClick={onBackToUser}
          className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors shadow-sm"
        >
          利用者画面へ戻る
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-around gap-12">
            <div className="shrink-0 flex flex-col items-center">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-6 text-center">貸出中カテゴリー内訳</p>
                <MultiSegmentDoughnut data={stats.borrowedBreakdown} />
            </div>
            
            <div className="flex-1 w-full max-w-xs space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 ml-2">内訳 (%)</p>
              {stats.borrowedBreakdown.map((item, idx) => {
                const percentage = stats.borrowedTotal > 0 ? (item.value / stats.borrowedTotal) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-3 hover:bg-slate-50 transition-colors px-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: item.color }}>
                        {CATEGORY_ICONS[item.label]}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-indigo-600">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>

        <div className="md:col-span-4 grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">総端末数</p>
            <p className="text-3xl font-black text-slate-900">{stats.total}<span className="text-sm font-bold ml-1 text-slate-400">台</span></p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">貸出中</p>
            <p className="text-3xl font-black text-rose-500">{stats.borrowedTotal}<span className="text-sm font-bold ml-1 text-slate-400">台</span></p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">利用可能</p>
            <p className="text-3xl font-black text-green-500">{stats.available}<span className="text-sm font-bold ml-1 text-slate-400">台</span></p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['status', 'manage', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'status' ? '在庫状況' : tab === 'manage' ? '端末管理' : '貸出返却履歴'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[400px]">
        {activeTab === 'status' && (
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">カテゴリー</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">端末番号</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状態</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {devices.map(device => {
                  return (
                    <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">{device.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{device.deviceNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block w-fit ${
                            device.status === 'available' ? 'bg-green-100 text-green-700' : 
                            device.status === 'returned' ? 'bg-amber-100 text-amber-700' : 
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {device.status === 'available' ? '利用可能' : 
                            device.status === 'returned' ? '返却済み (点検中)' : 
                            '貸出中'}
                          </span>
                          {device.status === 'borrowed' && (
                            <span className="text-xs text-slate-500 font-bold">利用者: {device.currentUser}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {device.status === 'returned' && (
                          <button
                            onClick={(e) => handleMakeAvailable(e, device.id)}
                            className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                          >
                            利用可能にする
                          </button>
                        )}
                        {device.status === 'borrowed' && (
                          <span className="text-[10px] text-slate-400 italic">貸出中</span>
                        )}
                        {device.status === 'available' && (
                          <span className="text-[10px] text-green-500 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="p-8">
            <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              </span>
              端末の追加
            </h4>
            
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 bg-blue-50/30 p-8 rounded-3xl border border-blue-50 shadow-inner">
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">カテゴリー</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-medium appearance-none shadow-sm"
                  value={newDeviceCategory}
                  onChange={(e) => setNewDeviceCategory(e.target.value as CategoryType)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">端末番号 (必須)</label>
                <input
                  type="text"
                  required
                  placeholder="例: IPAD-005"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium shadow-sm"
                  value={newDeviceNumber}
                  onChange={(e) => setNewDeviceNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">資産管理番号</label>
                <input
                  type="text"
                  placeholder="例: ASSET-2023-001"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium shadow-sm"
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">電話番号</label>
                <input
                  type="text"
                  placeholder="例: 070-1234-5678"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium shadow-sm"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">保管場所</label>
                <input
                  type="text"
                  placeholder="例: 貸出ロッカー / ロッカー03"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium shadow-sm"
                  value={newDeviceLocation}
                  onChange={(e) => setNewDeviceLocation(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                >
                  登録する
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map(device => (
                <div key={device.id} className="group bg-white border border-slate-100 p-5 rounded-2xl flex flex-col justify-between hover:border-blue-200 hover:shadow-lg transition-all relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        {CATEGORY_ICONS[device.category]}
                        </div>
                        <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{device.category}</p>
                        <p className="font-bold text-slate-800">{device.deviceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                          onClick={() => setEditingDevice({ ...device })}
                          className="text-slate-300 hover:text-blue-500 p-2 transition-all"
                          title="編集"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button 
                          onClick={() => onDeleteDevice(device.id)}
                          className="text-slate-300 hover:text-rose-500 p-2 transition-all"
                          title="削除"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  {device.status === 'borrowed' && (
                    <div className="mt-3 text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 animate-in fade-in duration-300">
                      貸出中：{device.currentUser}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-0">
            <div className="flex items-center gap-2 p-6 border-b border-slate-100 bg-slate-50/30 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">絞り込み:</span>
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${historyFilter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                すべて
              </button>
              <button
                onClick={() => setHistoryFilter('lending')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${historyFilter === 'lending' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                利用申請
              </button>
              <button
                onClick={() => setHistoryFilter('return')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${historyFilter === 'return' ? 'bg-green-600 text-white shadow-md shadow-green-100' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                返却済み
              </button>
              <button
                onClick={() => setHistoryFilter('date_change')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${historyFilter === 'date_change' ? 'bg-amber-600 text-white shadow-md shadow-amber-100' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                予定変更
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">日時</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">端末</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">社員</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">詳細</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getActionBadge(log.actionType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-600 font-black tracking-tight">{log.deviceNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                          <span className="text-[10px] text-slate-400">ID: {log.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate font-medium">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        履歴が見つかりません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Edit Registration Info</p>
                        <h3 className="text-xl font-black">{editingDevice.deviceNumber}</h3>
                    </div>
                    <button 
                        onClick={() => setEditingDevice(null)}
                        className="hover:bg-white/10 p-2 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">カテゴリー</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium appearance-none"
                          value={editingDevice.category}
                          onChange={(e) => setEditingDevice({ ...editingDevice, category: e.target.value as CategoryType })}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">端末番号</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium"
                          value={editingDevice.deviceNumber}
                          onChange={(e) => setEditingDevice({ ...editingDevice, deviceNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">資産管理番号</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium"
                          value={editingDevice.assetId || ''}
                          onChange={(e) => setEditingDevice({ ...editingDevice, assetId: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">電話番号</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium"
                          value={editingDevice.phoneNumber || ''}
                          onChange={(e) => setEditingDevice({ ...editingDevice, phoneNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">保管場所</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-slate-700 font-medium"
                          value={editingDevice.location || ''}
                          onChange={(e) => setEditingDevice({ ...editingDevice, location: e.target.value })}
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] mt-4"
                    >
                        更新する
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
