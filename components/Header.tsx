
import React from 'react';

interface HeaderProps {
  onAdminToggle: () => void;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAdminToggle, isAdmin }) => {
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
          <button 
            onClick={onAdminToggle}
            className={`text-xs font-bold transition-all uppercase tracking-widest border rounded-full px-4 py-1.5 ${
              isAdmin 
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' 
                : 'text-slate-400 border-slate-100 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            {isAdmin ? 'Exit Admin' : 'Admin Access'}
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
            {isAdmin ? (
              <div className="bg-indigo-600 w-full h-full flex items-center justify-center text-white text-xs font-bold">ADM</div>
            ) : (
              <span className="text-sm font-bold text-slate-600">JD</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
