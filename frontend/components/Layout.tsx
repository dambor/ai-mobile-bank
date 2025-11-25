import React from 'react';
import { Home, CreditCard, MessageSquare, Clock, User } from 'lucide-react';
import { Tab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="h-full bg-gray-950 text-white flex flex-col relative overflow-hidden">

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-gray-950/90 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            NeoBank
          </h1>
          <p className="text-xs text-gray-400">Welcome back, Alex</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
          <User size={20} className="text-gray-400" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 z-30 pb-6 pt-3 px-6">
        <ul className="flex justify-between items-center">
          <li>
            <button
              onClick={() => onTabChange(Tab.DASHBOARD)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.DASHBOARD ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Home size={24} strokeWidth={activeTab === Tab.DASHBOARD ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onTabChange(Tab.WALLET)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.WALLET ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <CreditCard size={24} strokeWidth={activeTab === Tab.WALLET ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Wallet</span>
            </button>
          </li>
          <li>
            <div className="relative -top-6">
              <button
                onClick={() => onTabChange(Tab.CHAT)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 transition-transform hover:scale-105 active:scale-95
                  ${activeTab === Tab.CHAT ? 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
              >
                <MessageSquare size={24} fill={activeTab === Tab.CHAT ? "currentColor" : "none"} />
              </button>
            </div>
          </li>
          <li>
            <button
              onClick={() => onTabChange(Tab.HISTORY)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.HISTORY ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Clock size={24} strokeWidth={activeTab === Tab.HISTORY ? 2.5 : 2} />
              <span className="text-[10px] font-medium">History</span>
            </button>
          </li>
          <li>
            <button
              className={`flex flex-col items-center gap-1 transition-colors text-gray-500 hover:text-gray-300`}
              onClick={() => alert("Profile Settings")}
            >
              <User size={24} />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};