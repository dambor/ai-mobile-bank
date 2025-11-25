
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, Zap, MoreHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import { Tab, Transaction } from '../types';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { getAccountBalance, getTransactions } from '../services/astraService';

interface DashboardProps {
  onChangeTab: (tab: Tab) => void;
}



export const Dashboard: React.FC<DashboardProps> = ({ onChangeTab }) => {
  const [balance, setBalance] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);

  // Independent loading states for progressive rendering
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Load Balance Independently
    const loadBalance = async () => {
      try {
        const val = await getAccountBalance();
        if (isMounted) setBalance(val);
      } catch (e) { console.error(e); }
      finally { if (isMounted) setLoadingBalance(false); }
    };

    // Load Transactions Independently
    const loadTransactions = async () => {
      try {
        const list = await getTransactions();

        // Calculate totals
        let inc = 0;
        let exp = 0;
        const spendingByDate: Record<string, number> = {};

        list.forEach(t => {
          if (t.amount > 0) {
            inc += t.amount;
          } else {
            const absAmount = Math.abs(t.amount);
            exp += absAmount;

            // Chart Data Processing
            // Use timestamp if available, otherwise fallback to index-based date logic or today
            let dateKey = '';
            if (t.timestamp) {
              dateKey = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
              // Fallback for mock data without timestamps
              dateKey = 'Recent';
            }

            if (dateKey) {
              spendingByDate[dateKey] = (spendingByDate[dateKey] || 0) + absAmount;
            }
          }
        });

        // Convert to array and reverse to show chronological order if needed
        // For this simple view, we just take the entries. 
        // If using real timestamps, we should sort them.
        let chartDataArray = Object.entries(spendingByDate).map(([date, value]) => ({ date, value }));

        // If we have timestamps, sort by date. 
        // Since the keys are formatted strings, sorting might be tricky. 
        // Better approach: Sort transactions first, then aggregate.
        // But for now, let's just rely on the list order if it's chronological.
        // If the list is newest first, we should reverse for the chart (oldest to newest).
        if (chartDataArray.length > 0) {
          chartDataArray = chartDataArray.reverse();
        }

        // Ensure we have at least some data points for the chart to look good
        if (chartDataArray.length === 0) {
          chartDataArray = [
            { date: 'Mon', value: 0 },
            { date: 'Tue', value: 0 },
            { date: 'Wed', value: 0 },
            { date: 'Thu', value: 0 },
            { date: 'Fri', value: 0 },
            { date: 'Sat', value: 0 },
            { date: 'Sun', value: 0 },
          ];
        }

        if (isMounted) {
          setIncome(inc);
          setExpense(exp);
          setRecentTransactions(list.slice(0, 5));
          setChartData(chartDataArray);
        }
      } catch (e) { console.error(e); }
      finally { if (isMounted) setLoadingTransactions(false); }
    };

    loadBalance();
    loadTransactions();

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="px-6 space-y-6 animate-fade-in">

      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-800 shadow-lg relative overflow-hidden min-h-[160px]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        {loadingBalance ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="bg-emerald-500 rounded-full p-0.5">
                  <ArrowDownLeft size={12} className="text-gray-900" />
                </div>
                <span className="text-emerald-400 text-xs font-semibold">+ ${income.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                <div className="bg-rose-500 rounded-full p-0.5">
                  <ArrowUpRight size={12} className="text-white" />
                </div>
                <span className="text-rose-400 text-xs font-semibold">- ${expense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between gap-2">
        <ActionButton icon={<ArrowUpRight />} label="Send" color="bg-blue-600" />
        <ActionButton icon={<ArrowDownLeft />} label="Request" color="bg-gray-800" />
        <ActionButton icon={<Zap />} label="Pay" color="bg-gray-800" />
        <ActionButton icon={<MoreHorizontal />} label="More" color="bg-gray-800" />
      </div>

      {/* Spending Chart Preview */}
      <div className="bg-gray-900/50 rounded-2xl p-5 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-200">Spending Activity</h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">Weekly</span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Header */}
      <div className="flex justify-between items-end pt-2">
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        <button
          onClick={() => onChangeTab(Tab.HISTORY)}
          className="text-blue-400 text-sm flex items-center hover:text-blue-300"
        >
          View All <ChevronRight size={16} />
        </button>
      </div>

      {/* Transaction List Items */}
      <div className="space-y-3 pb-6">
        {loadingTransactions ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-900/50 rounded-2xl animate-pulse" />
            <div className="h-16 bg-gray-900/50 rounded-2xl animate-pulse delay-75" />
            <div className="h-16 bg-gray-900/50 rounded-2xl animate-pulse delay-150" />
          </div>
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((t) => (
            <TransactionItem
              key={t.id}
              title={t.title}
              subtitle={t.subtitle}
              amount={t.amount}
              date={t.date}
              icon={t.icon}
              isPositive={t.amount > 0}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <span className="text-xs">No transactions found</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, color: string }> = ({ icon, label, color }) => (
  <button className="flex-1 flex flex-col items-center gap-2 group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 transition-transform group-active:scale-95`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
  </button>
);

interface TransactionItemProps {
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  icon?: string;
  isPositive?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ title, subtitle, amount, date, icon, isPositive }) => {
  const isUrl = icon?.startsWith('http');
  const iconBgColor = isPositive ? 'bg-emerald-500' : 'bg-gray-800';

  return (
    <div className="flex items-center justify-between bg-gray-900/30 p-4 rounded-2xl border border-gray-800 hover:bg-gray-900/60 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${isUrl ? 'bg-white' : iconBgColor}`}>
          {isUrl ? (
            <img src={icon} alt={title} className="w-6 h-6 object-contain" />
          ) : (
            <span className="font-bold text-white text-sm">{icon}</span>
          )}
        </div>
        <div>
          <h4 className="font-medium text-gray-200">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
          {isPositive ? '+' : ''}${Math.abs(amount).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
};
