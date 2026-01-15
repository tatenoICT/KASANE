
import React from 'react';
import { CategoryType } from '../types';

interface CategoryGridProps {
  onSelect: (category: CategoryType) => void;
}

const CATEGORIES_DATA: { type: CategoryType; icon: React.ReactNode; color: string }[] = [
  { 
    type: 'Wi-Fi', 
    color: 'bg-blue-500', 
    icon: (
      <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
    )
  },
  { 
    type: 'iPhone', 
    color: 'bg-rose-500', 
    icon: (
      <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2zM10 5h4"></path></svg>
    )
  },
  { 
    type: 'iPad', 
    color: 'bg-indigo-500', 
    icon: (
      <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
    )
  },
  { 
    type: 'PC', 
    color: 'bg-slate-700', 
    icon: (
      <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2m16 0h-16"></path></svg>
    )
  },
  { 
    type: 'その他周辺機器', 
    color: 'bg-teal-500', 
    icon: (
      <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="7" y="2" width="10" height="20" rx="5" strokeWidth="2" />
        <path d="M12 2v7M7 9h10" strokeWidth="2" />
      </svg>
    )
  },
];

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
      {CATEGORIES_DATA.map((cat) => (
        <button
          key={cat.type}
          onClick={() => onSelect(cat.type)}
          className="group relative bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col items-center text-center overflow-hidden"
        >
          <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl ${cat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {cat.icon}
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-slate-800 leading-tight">{cat.type}</h3>
          <div className="absolute top-0 right-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
