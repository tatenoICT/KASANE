
import React, { useState, useMemo } from 'react';
import { HistoryLog, ActionType } from '../types';

interface LendingHistoryViewProps {
  historyLogs: HistoryLog[];
  onStartLending: () => void;
}

const LendingHistoryView: React.FC<LendingHistoryViewProps> = ({ historyLogs, onStartLending }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | ActionType>('all');
  const [searchNumber, setSearchNumber] = useState('');

  const filteredLogs = useMemo(() => {
    // リマインド送信は除外
    let base = historyLogs.filter(log => log.actionType !== 'reminder_sent').reverse();
    
    if (filterStatus !== 'all') {
      base = base.filter(log => log.actionType === filterStatus);
    }
    
    if (searchNumber) {
      const search = searchNumber.toLowerCase();
      base = base.filter(log => log.deviceNumber.toLowerCase().includes(search));
    }
    
    return base;
  }, [historyLogs, filterStatus, searchNumber]);

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
    <div className="space-y-6 px-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">貸出履歴</h2>
          <p className="text-slate-500 mt-1 font-medium">全端末の利用状況を確認できます。</p>
        </div>
        <button 
          onClick={onStartLending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          端末を借りる
        </button>
      </div>

      {/* フィルタリングエリア */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ステータス</label>
          <select 
            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
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
              className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
              value={searchNumber}
              onChange={e => setSearchNumber(e.target.value)}
            />
            <svg className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      {/* 履歴テーブル */}
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
          {filteredLogs.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-300 font-bold">表示する履歴はありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LendingHistoryView;
