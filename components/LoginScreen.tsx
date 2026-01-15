
import React, { useState } from 'react';
import { STAFF_DIRECTORY } from '../constants';
import { Staff } from '../types';

interface LoginScreenProps {
  onUserLogin: (staff: Staff) => void;
  onAdminLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onUserLogin, onAdminLogin }) => {
  const [mode, setMode] = useState<'select' | 'user' | 'admin'>('select');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = STAFF_DIRECTORY.find(s => s.id === inputValue);
    if (staff) {
      onUserLogin(staff);
    } else {
      setError('有効な社員番号が見つかりません');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue === 'admin') {
      onAdminLogin();
    } else {
      setError('パスワードが正しくありません');
    }
  };

  const reset = () => {
    setMode('select');
    setInputValue('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 01-2 2v-2a2 2 0 012-2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path></svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">KASANE</h1>
          <p className="text-indigo-100 text-sm font-medium tracking-wide">端末貸出管理システム</p>
        </div>

        <div className="p-10">
          {mode === 'select' ? (
            <div className="space-y-4">
              <button 
                onClick={() => setMode('user')}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                社員としてログイン
              </button>
              <button 
                onClick={() => setMode('admin')}
                className="w-full bg-white text-indigo-600 border-2 border-indigo-50 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                管理者としてログイン
              </button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <button onClick={reset} className="text-slate-400 hover:text-indigo-600 text-sm font-bold flex items-center gap-1 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                戻る
              </button>
              <h2 className="text-xl font-black text-slate-900 mb-6">
                {mode === 'user' ? '社員番号を入力' : '管理者パスワード'}
              </h2>
              <form onSubmit={mode === 'user' ? handleUserLogin : handleAdminLogin} className="space-y-4">
                <input
                  autoFocus
                  required
                  type={mode === 'user' ? 'text' : 'password'}
                  placeholder={mode === 'user' ? '例: 3669' : 'パスワードを入力'}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-slate-800 font-bold text-lg"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-rose-500 text-sm font-bold ml-2 animate-bounce">{error}</p>}
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  ログイン
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
