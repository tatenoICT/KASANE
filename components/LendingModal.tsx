
import React, { useState, useEffect } from 'react';
import { Device, LendingRecord, Staff } from '../types';
import { STAFF_DIRECTORY } from '../constants';

interface LendingModalProps {
  device: Device;
  onClose: () => void;
  // Updated to include remindersSent in the Omit list
  onSubmit: (record: Omit<LendingRecord, 'id' | 'timestamp' | 'status' | 'remindersSent'>) => void;
}

const LendingModal: React.FC<LendingModalProps> = ({ device, onClose, onSubmit }) => {
  const savedUserStr = localStorage.getItem('kasane_logged_user');
  const loggedUser: Staff | null = savedUserStr ? JSON.parse(savedUserStr) : null;

  const [formData, setFormData] = useState({
    employeeId: loggedUser?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    reason: '',
  });
  const [foundStaff, setFoundStaff] = useState<Staff | null>(loggedUser);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const staff = STAFF_DIRECTORY.find(s => s.id === formData.employeeId);
    setFoundStaff(staff || null);
  }, [formData.employeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foundStaff) {
      window.alert('有効な社員番号を入力してください');
      return;
    }

    if (!formData.expectedReturnDate || !formData.reason) {
      window.alert('全ての項目を入力してください');
      return;
    }

    setSubmitting(true);
    
    onSubmit({
      ...formData,
      userName: foundStaff.name,
      userEmail: foundStaff.email,
      deviceId: device.id,
    });
    
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 px-6 py-4 md:px-8 md:py-6 flex justify-between items-center text-white sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Application for Use</span>
            <h3 className="text-xl md:text-2xl font-black">{device.deviceNumber}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors" type="button">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="px-6 md:px-8 pt-4 md:pt-6 pb-1 md:pb-2 space-y-3">
            <div className="bg-indigo-50/50 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 border border-indigo-100/50">
                <div className="bg-white p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-sm shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                    <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-wider">保管場所</p>
                    <p className="text-xs md:text-sm font-bold text-slate-700">{device.location || '管理者に確認してください'}</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-5">
          <div className="relative">
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 ml-1">社員番号</label>
            <input
              required
              type="text"
              className={`w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border ${foundStaff ? 'border-green-200 bg-green-50/20' : 'border-slate-200'} focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-sm md:text-base`}
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="4桁の社員番号"
            />
            {formData.employeeId && (
              <div className="absolute right-4 top-[32px] md:top-[38px]">
                {foundStaff ? (
                  <span className="text-green-600 flex items-center gap-1 font-bold text-xs md:text-sm animate-in fade-in slide-in-from-right-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {foundStaff.name}
                  </span>
                ) : (
                  <span className="text-slate-300 text-[10px] md:text-xs italic">社員が見つかりません</span>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 ml-1">利用開始日</label>
              <input
                required
                type="date"
                className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-sm md:text-base"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 ml-1">返却予定日</label>
              <input
                required
                type="date"
                className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-sm md:text-base"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 ml-1">利用理由</label>
            <textarea
              required
              rows={2}
              className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium resize-none text-sm md:text-base"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="利用目的を入力してください"
            ></textarea>
          </div>

          <div className="pt-2 md:pt-4">
            <button
              disabled={submitting || !foundStaff}
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-xl shadow-slate-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {submitting ? '送信中...' : '利用を申請する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LendingModal;
