
import React, { useState, useMemo } from 'react';
import { Device, LendingRecord, CategoryType } from '../types';
import { CATEGORIES } from '../constants';

interface AdminDashboardProps {
  devices: Device[];
  records: LendingRecord[];
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
  'iPad': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
  'iPhone': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 5h6"></path></svg>,
  'PC': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  'その他周辺機器': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
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
  records, 
  onAddDevice, 
  onUpdateDevice,
  onDeleteDevice, 
  onBackToUser 
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'history' | 'manage'>('status');
  const [manageCategoryTab, setManageCategoryTab] = useState<CategoryType>('Wi-Fi');
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
      deviceNumber: editingDevice.deviceNumber,
      assetId: editingDevice.assetId,
      phoneNumber: editingDevice.phoneNumber,
      location: editingDevice.location,
    });
    setEditingDevice(null);
  };

  const filteredManageDevices = useMemo(() => {
    return devices.filter(d => d.category === manageCategoryTab);
  }, [devices, manageCategoryTab]);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
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
        {(['status', 'history', 'manage'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'status' ? '在庫状況' : tab === 'history' ? '貸出履歴' : '端末管理'}
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

        {activeTab === 'history' && (
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">日付</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">社員</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">端末</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状態</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">通知先</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...records].reverse().map(record => {
                  const device = devices.find(d => d.id === record.deviceId);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(record.timestamp).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{record.userName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">ID: {record.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{device?.deviceNumber || '不明'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${record.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                          {record.status === 'active' ? '貸出中' : '返却済み'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">{record.userEmail}</td>
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

            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setManageCategoryTab(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    manageCategoryTab === category 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredManageDevices.length > 0 ? (
                filteredManageDevices.map(device => (
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
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-slate-400 text-sm font-medium">このカテゴリーに登録されている端末はありません</p>
                </div>
              )}
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
