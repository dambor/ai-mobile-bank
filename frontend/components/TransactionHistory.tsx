
import React, { useEffect, useState } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { getTransactions } from '../services/astraService';
import { Transaction } from '../types';

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const data = await getTransactions();
        if (isMounted) setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen pb-24 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>
        <button className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
            <Filter size={18} />
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">All Transactions</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xs">Syncing with ledger...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
           <div className="text-center py-10 text-gray-500 text-sm">No transactions found.</div>
        ) : (
          filteredTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/20 hover:bg-gray-900/60 border border-transparent hover:border-gray-800 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden 
                        ${t.amount > 0 ? 'bg-emerald-900/20 text-emerald-400' : 'bg-gray-800 text-gray-300'}
                        ${t.icon.startsWith('http') ? 'bg-white' : ''}`}>
                        {t.icon.startsWith('http') ? (
                          <img src={t.icon} alt={t.title} className="w-6 h-6 object-contain" />
                        ) : (
                          t.icon
                        )}
                    </div>
                    <div>
                        <h4 className="text-gray-200 font-medium group-hover:text-white transition-colors">{t.title}</h4>
                        <p className="text-xs text-gray-500">{t.category} • {t.date}</p>
                    </div>
                </div>
                <span className={`font-bold ${t.amount > 0 ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                </span>
            </div>
          ))
        )}
      </div>
      
      {!isLoading && (
        <div className="text-center mt-8">
            <button className="text-xs text-gray-500 hover:text-blue-400 transition-colors">Load older transactions</button>
        </div>
      )}
    </div>
  );
};
