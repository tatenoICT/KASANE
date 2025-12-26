
import React, { useState } from 'react';
import { Device } from '../types';

interface EditReturnDateModalProps {
  device: Device;
  onClose: () => void;
  onSave: (newDate: string) => void;
}

const EditReturnDateModal: React.FC<EditReturnDateModalProps> = ({ device, onClose, onSave }) => {
  const [newDate, setNewDate] = useState(device.returnDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    onSave(newDate);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Edit Return Date</span>
            <h3 className="text-lg font-black">{device.deviceNumber}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">新しい返却予定日</label>
            <input
              required
              type="date"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReturnDateModal;
