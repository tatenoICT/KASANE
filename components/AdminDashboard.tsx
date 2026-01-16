
import React, { useState, useMemo } from 'react';
import { Device, HistoryLog, CategoryType, ActionType, LendingRecord, DeviceStatus } from '../types';
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
}

const CATEGORY_COLORS: Record<string, string> = {
  'Wi-Fi': 'bg-blue-500',
  'iPhone': 'bg-rose-500',
  'iPad': 'bg-indigo-500',
  'PC': 'bg-slate-700',
  'その他周辺機器': 'bg-teal-500'
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  devices, 
  historyLogs, 
  onAddDevice, 
  onUpdateDevice,
  onDeleteDevice, 
  onBackToUser,
  onCompleteInspection,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'manage' | 'history'>('status');
  
  // 各タブのフィルター用ステート
  const [statusCategoryFilter, setStatusCategoryFilter] = useState<'all' | CategoryType>('all');
  const [statusTypeFilter, setStatusTypeFilter] = useState<'all' | DeviceStatus | 'needs_action'>('all');
  
  const [manageCategoryFilter, setManageCategoryFilter] = useState<'all' | CategoryType>('all');
  
  const [historyFilter, setHistoryFilter] = useState<'all' | ActionType>('all');
  const [historyDeviceSearch, setHistoryDeviceSearch] = useState('');

  // 編集用モーダルのステート
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  // 新規登録フォーム用ステート
  const [newDeviceData, setNewDeviceData] = useState({
    category: 'Wi-Fi' as CategoryType,
    deviceNumber: '',
    assetId: '',
    location: '',
    phoneNumber: ''
  });

  // 編集フォーム用ステート
  const [editFormData, setEditFormData] = useState({
    category: 'Wi-Fi' as CategoryType,
    deviceNumber: '',
    assetId: '',
    location: '',
    phoneNumber: ''
  });

  // 履歴のフィルタリング
  const filteredLogs = useMemo(() => {
    let base = historyLogs.filter(log => log.actionType !== 'reminder_sent').reverse();
    if (historyFilter !== 'all') {
      base = base.filter(log => log.actionType === historyFilter);
    }
    if (historyDeviceSearch) {
      const search = historyDeviceSearch.toLowerCase();
      base = base.filter(log => log.deviceNumber.toLowerCase().includes(search));
    }
    return base;
  }, [historyLogs, historyFilter, historyDeviceSearch]);

  // 端末管理のフィルタリング
  const filteredManageDevices = useMemo(() => {
    if (manageCategoryFilter === 'all') return devices;
    return devices.filter(d => d.category === manageCategoryFilter);
  }, [devices, manageCategoryFilter]);

  // 在庫状況のフィルタリング
  const filteredStatusDevices = useMemo(() => {
    let base = [...devices];
    
    if (statusCategoryFilter !== 'all') {
      base = base.filter(d => d.category === statusCategoryFilter);
    }
    
    if (statusTypeFilter !== 'all') {
      if (statusTypeFilter === 'needs_action') {
        base = base.filter(d => d.status === 'returned');
      } else {
        base = base.filter(d => d.status === statusTypeFilter);
      }
    }
    
    return base;
  }, [devices, statusCategoryFilter, statusTypeFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceData.deviceNumber) {
      window.alert('端末番号を入力してください');
      return;
    }
    onAddDevice(newDeviceData.category, newDeviceData.deviceNumber, {
      assetId: newDeviceData.assetId,
      location: newDeviceData.location,
      phoneNumber: newDeviceData.phoneNumber
    });
    setNewDeviceData({
      category: 'Wi-Fi',
      deviceNumber: '',
      assetId: '',
      location: '',
      phoneNumber: ''
    });
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setEditFormData({
      category: device.category,
      deviceNumber: device.deviceNumber,
      assetId: device.assetId || '',
      location: device.location || '',
      phoneNumber: device.phoneNumber || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    onUpdateDevice(editingDevice.id, editFormData);
    setIsEditModalOpen(false);
  };

  const getActionBadge = (type: ActionType) => {
    switch (type) {
      case 'lending': return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">利用申請</span>;
      case 'return': return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">返却済み</span>;
      case 'date_change': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">予定変更</span>;
      case 'inspection_complete': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">点検完了</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">ADMIN <span className="text-indigo-600">DASHBOARD</span></h2>
        </div>
        <button onClick={onBackToUser} className="bg-white text-indigo-600 border-2 border-indigo-50 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          利用者画面へ
        </button>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {(['status', 'manage', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-black transition-all whitespace-nowrap flex items-center gap-2 text-sm ${
              activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
            }`}
          >
            {tab === 'status' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
            {tab === 'manage' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
            {tab === 'history' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            {tab === 'status' ? '在庫状況' : tab === 'manage' ? '端末管理' : '貸出履歴'}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {/* 在庫状況タブ */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {/* フィルターエリア */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">カテゴリー</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                  value={statusCategoryFilter}
                  onChange={e => setStatusCategoryFilter(e.target.value as any)}
                >
                  <option value="all">すべてのカテゴリー</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">状態・アクション</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                  value={statusTypeFilter}
                  onChange={e => setStatusTypeFilter(e.target.value as any)}
                >
                  <option value="all">すべての状態</option>
                  <option value="available">利用可能</option>
                  <option value="borrowed">貸出中</option>
                  <option value="needs_action">要点検 (返却済み)</option>
                </select>
              </div>
              <div className="flex-none">
                <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-5 py-3 rounded-2xl border border-indigo-100 inline-block">
                  表示中: {filteredStatusDevices.length} 件
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">カテゴリー</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">端末番号</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状態</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">利用者</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStatusDevices.map(device => (
                      <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[device.category]}`}></span>
                            <span className="text-sm font-bold text-slate-600">{device.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">{device.deviceNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${device.status === 'available' ? 'bg-green-100 text-green-700' : device.status === 'returned' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {device.status === 'available' ? '利用可能' : device.status === 'returned' ? '点検中' : '貸出中'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{device.currentUser || "-"}</td>
                        <td className="px-6 py-4 text-right">
                          {device.status === 'returned' && (
                            <button onClick={() => onCompleteInspection(device.id)} className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2 px-4 rounded-xl shadow-lg shadow-green-100 transition-all">点検完了</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStatusDevices.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-slate-300 font-bold">該当する端末はありません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 端末管理タブ */}
        {activeTab === 'manage' && (
          <div className="space-y-12">
            {/* 新規登録セクション */}
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">新規端末登録</h3>
              </div>
              
              <div className="bg-slate-50 border-2 border-indigo-100/50 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
                <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">カテゴリー</label>
                    <select 
                      className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-black text-slate-700"
                      value={newDeviceData.category}
                      onChange={e => setNewDeviceData({ ...newDeviceData, category: e.target.value as CategoryType })}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">端末番号 <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      type="text"
                      className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-black"
                      placeholder="例: WIFI-101"
                      value={newDeviceData.deviceNumber}
                      onChange={e => setNewDeviceData({ ...newDeviceData, deviceNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">資産管理番号</label>
                    <input 
                      type="text"
                      className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                      placeholder="例: NW-2024-001"
                      value={newDeviceData.assetId}
                      onChange={e => setNewDeviceData({ ...newDeviceData, assetId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">保管場所</label>
                    <input 
                      type="text"
                      className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                      placeholder="例: 貸出棚 A-3"
                      value={newDeviceData.location}
                      onChange={e => setNewDeviceData({ ...newDeviceData, location: e.target.value })}
                    />
                  </div>
                  {(newDeviceData.category === 'Wi-Fi' || newDeviceData.category === 'iPhone') && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">電話番号</label>
                      <input 
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                        placeholder="070-0000-0000"
                        value={newDeviceData.phoneNumber}
                        onChange={e => setNewDeviceData({ ...newDeviceData, phoneNumber: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="flex items-end lg:col-span-full xl:col-span-1">
                    <button 
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95"
                    >
                        登録を完了する
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* 端末一覧セクション */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">登録済み端末一覧</h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">絞り込み:</label>
                     <select 
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      value={manageCategoryFilter}
                      onChange={e => setManageCategoryFilter(e.target.value as any)}
                     >
                        <option value="all">すべてのカテゴリー</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                     </select>
                   </div>
                   <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-4 py-1.5 rounded-full border border-indigo-100">
                     {manageCategoryFilter !== 'all' ? `${manageCategoryFilter} ` : ''}{filteredManageDevices.length} 台
                   </span>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">カテゴリー</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">端末番号</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">資産管理番号</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">保管場所</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredManageDevices.map(device => (
                        <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[device.category]}`}></span>
                              <span className="text-sm font-bold text-slate-600">{device.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">{device.deviceNumber}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">
                            {device.assetId ? <span className="bg-slate-100 px-2 py-1 rounded text-[11px] font-black text-slate-500 tracking-tight">{device.assetId}</span> : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">{device.location || "-"}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(device)}
                                className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all group active:scale-90"
                                title="情報を編集"
                              >
                                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                </svg>
                              </button>
                              <button 
                                onClick={() => onDeleteDevice(device.id)}
                                className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                title="削除"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredManageDevices.length === 0 && (
                    <div className="p-20 text-center">
                      <p className="text-slate-300 font-bold">
                        {manageCategoryFilter !== 'all' ? `${manageCategoryFilter}の端末は登録されていません` : '登録されている端末はありません'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 貸出履歴タブ */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ステータス</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                  value={historyFilter}
                  onChange={e => setHistoryFilter(e.target.value as any)}
                >
                  <option value="all">すべてのステータス</option>
                  <option value="lending">利用申請</option>
                  <option value="return">返却済み</option>
                  <option value="date_change">予定変更</option>
                  <option value="inspection_complete">点検完了</option>
                </select>
              </div>
              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">端末番号で検索</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="例: WIFI-001"
                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
                    value={historyDeviceSearch}
                    onChange={e => setHistoryDeviceSearch(e.target.value)}
                  />
                  <svg className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">日時</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ステータス</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">端末番号</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">社員</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">詳細</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getActionBadge(log.actionType)}</td>
                        <td className="px-6 py-4 text-sm text-indigo-600 font-black">{log.deviceNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.userName}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{log.details || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 編集用モーダル */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Update Configuration</span>
                <h3 className="text-2xl font-black">端末情報を編集</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">カテゴリー</label>
                  <select 
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-black text-slate-700"
                    value={editFormData.category}
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value as CategoryType })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">端末番号</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-black"
                    value={editFormData.deviceNumber}
                    onChange={e => setEditFormData({ ...editFormData, deviceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">資産管理番号 (任意)</label>
                <input 
                  type="text"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                  value={editFormData.assetId}
                  onChange={e => setEditFormData({ ...editFormData, assetId: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">保管場所 (任意)</label>
                <input 
                  type="text"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                  value={editFormData.location}
                  onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                />
              </div>

              {(editFormData.category === 'Wi-Fi' || editFormData.category === 'iPhone') && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">電話番号 (任意)</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                    value={editFormData.phoneNumber}
                    onChange={e => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                  更新を保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
