import React from 'react';
import { Plus, Wifi } from 'lucide-react';

export const Wallet: React.FC = () => {
  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Cards</h2>
        <button className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 hover:bg-gray-700 transition-colors">
          <Plus size={24} />
        </button>
      </div>

      {/* Card 1: Primary */}
      <div className="group relative h-56 w-full perspective-1000">
        <div className="relative w-full h-full rounded-3xl bg-gradient-to-bl from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-900/30 border-t border-white/10 overflow-hidden transform transition-transform hover:-translate-y-2 duration-300">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black/20 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <span className="font-mono text-xs opacity-80 border border-white/20 px-2 py-1 rounded">Debit</span>
            <Wifi size={24} className="opacity-70 rotate-90" />
          </div>

          <div className="mt-8 relative z-10">
            <h3 className="text-2xl font-mono tracking-wider">5412 •••• •••• 9821</h3>
          </div>

          <div className="mt-10 flex justify-between items-end relative z-10">
            <div>
              <p className="text-[10px] uppercase opacity-60 mb-1">Card Holder</p>
              <p className="font-medium tracking-wide">ALEX JOHNSON</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] uppercase opacity-60 mb-1">Expires</p>
              <p className="font-mono">12/28</p>
            </div>
          </div>
          
          <div className="absolute bottom-6 right-6">
             {/* Simple Mastercard-like circles */}
             <div className="flex relative">
                <div className="w-8 h-8 bg-red-500/80 rounded-full"></div>
                <div className="w-8 h-8 bg-yellow-500/80 rounded-full -ml-4"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Card 2: Secondary */}
      <div className="relative w-full h-56 rounded-3xl bg-gray-800 p-6 text-gray-300 border border-gray-700 shadow-lg transform scale-95 opacity-60 -mt-40 hover:-mt-36 hover:opacity-100 transition-all duration-300 cursor-pointer z-0">
        <div className="flex justify-between items-start">
          <span className="font-mono text-xs border border-gray-600 px-2 py-1 rounded">Virtual</span>
          <Wifi size={24} className="opacity-50 rotate-90" />
        </div>
        <div className="mt-8">
            <h3 className="text-2xl font-mono tracking-wider">4000 •••• •••• 1234</h3>
        </div>
        <div className="mt-10 flex justify-between items-end">
            <div>
              <p className="font-medium tracking-wide">ALEX JOHNSON</p>
            </div>
             <div className="font-bold italic text-lg text-white">VISA</div>
        </div>
      </div>

      {/* Card Details / Limits */}
      <div className="pt-20">
         <h3 className="text-lg font-semibold text-white mb-4">Card Settings</h3>
         <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Online Payments</span>
                <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
            </div>
            <div className="w-full h-px bg-gray-800"></div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">ATM Withdrawals</span>
                <div className="w-11 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-gray-400 rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
};