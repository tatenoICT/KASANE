
import React from 'react';
import { Staff } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  loggedInUser: Staff | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, loggedInUser, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 01-2 2v-2a2 2 0 012-2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">KASANE</h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold">
              {isAdmin ? 'ADMIN CONSOLE' : 'Lending Management'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-800 leading-none">
              {isAdmin ? 'Administrator' : loggedInUser?.name}
            </p>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 border border-slate-100 rounded-full px-4 py-1.5 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="hidden sm:inline">Logout</span>
          </button>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm ${isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {isAdmin ? (
              <span className="text-xs font-bold">ADM</span>
            ) : (
              <span className="text-sm font-bold">{loggedInUser?.name.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
