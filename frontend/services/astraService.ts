
import { Transaction } from '../types';

// Safe environment variable access
const env = (function () {
  try {
    // @ts-ignore
    return (import.meta as any).env || {};
  } catch {
    return {};
  }
})();

// The specific customer we are simulating interactions for, loaded from .env
export const CUSTOMER_ID = env.VITE_CUSTOMER_ID || '97074301-cb76-407c-b97c-fa1f7c43b286';

// API Endpoint provided by user, loaded from .env
// Defaults to localhost for local development as requested
const API_BASE_URL = env.VITE_BANKING_API_URL || '/api';

// Fallback Mock Data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Spotify',
    subtitle: 'Entertainment',
    amount: -15.99,
    date: 'Today, 9:00 AM',
    type: 'expense',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png',
    category: 'Entertainment'
  },
  {
    id: '2',
    title: 'Uber',
    subtitle: 'Transport',
    amount: -24.50,
    date: 'Yesterday',
    type: 'expense',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
    category: 'Transport'
  },
  {
    id: '3',
    title: 'Apple Store',
    subtitle: 'Electronics',
    amount: -999.00,
    date: 'Sep 12',
    type: 'expense',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    category: 'Shopping'
  },
  {
    id: '4',
    title: 'Upwork Inc.',
    subtitle: 'Freelance',
    amount: 850.00,
    date: 'Sep 10',
    type: 'income',
    icon: 'U',
    category: 'Income'
  },
  {
    id: '5',
    title: 'Starbucks',
    subtitle: 'Food & Drink',
    amount: -12.45,
    date: 'Sep 09',
    type: 'expense',
    icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png',
    category: 'Food & Drink'
  },
  {
    id: '6',
    title: 'Netflix',
    subtitle: 'Entertainment',
    amount: -14.99,
    date: 'Sep 08',
    type: 'expense',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png',
    category: 'Entertainment'
  },
  {
    id: '7',
    title: 'Target',
    subtitle: 'Shopping',
    amount: -143.20,
    date: 'Sep 05',
    type: 'expense',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Target_logo.svg/2048px-Target_logo.svg.png',
    category: 'Shopping'
  }
];

// Helper to get logos for known merchants
const getMerchantIcon = (merchantName: string): string => {
  const name = merchantName.toLowerCase();
  if (name.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png';
  if (name.includes('netflix')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png';
  if (name.includes('amazon')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/2048px-Amazon_icon.svg.png';
  if (name.includes('starbucks')) return 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png';
  if (name.includes('target')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Target_logo.svg/2048px-Target_logo.svg.png';
  if (name.includes('uber')) return 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png';
  if (name.includes('walmart')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/2048px-Walmart_logo.svg.png';
  if (name.includes('apple')) return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';
  if (name.includes('nike')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg';

  return merchantName.charAt(0).toUpperCase();
};

// Helper to infer category
const getCategory = (merchantName: string): string => {
  const name = merchantName.toLowerCase();
  if (name.includes('spotify') || name.includes('netflix')) return 'Entertainment';
  if (name.includes('starbucks') || name.includes('mcdonald') || name.includes('burger')) return 'Food & Drink';
  if (name.includes('uber') || name.includes('lyft')) return 'Transport';
  if (name.includes('amazon') || name.includes('target') || name.includes('walmart')) return 'Shopping';
  if (name.includes('salary') || name.includes('upwork')) return 'Income';
  return 'General';
};

// Helper to generate realistic dates since API doesn't return them
const generateDate = (index: number): string => {
  const today = new Date();
  const date = new Date(today);
  const daysBack = Math.floor(index / 3);
  date.setDate(today.getDate() - daysBack);

  if (daysBack === 0) {
    const hour = 18 - index;
    return `Today, ${hour}:30 PM`;
  }
  if (daysBack === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to format API timestamp
const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();

  // Check if today
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- PERFORMANCE OPTIMIZED FETCHING & CACHING ---

// Strategy definitions
interface FetchStrategy {
  name: string;
  fetch: (url: string) => Promise<any>;
}

const strategies: FetchStrategy[] = [
  {
    name: 'Direct',
    fetch: async (url) => {
      const headers: HeadersInit = { 'Accept': 'application/json' };
      // Only add ngrok header if connecting to ngrok, to avoid CORS issues on other domains
      if (url.includes('ngrok-free.app')) headers['ngrok-skip-browser-warning'] = 'true';
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Direct failed');
      return res.json();
    }
  },
  {
    name: 'AllOrigins',
    fetch: async (url) => {
      const u = `https://api.allorigins.win/get?url=${encodeURIComponent(url + '?t=' + Date.now())}`;
      const res = await fetch(u);
      if (!res.ok) throw new Error('AllOrigins failed');
      const data = await res.json();
      if (!data.contents) throw new Error('No content');
      return JSON.parse(data.contents);
    }
  },
  {
    name: 'CorsProxy',
    fetch: async (url) => {
      const u = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await fetch(u);
      if (!res.ok) throw new Error('CorsProxy failed');
      return res.json();
    }
  }
];

// Custom implementation of Promise.any for environments that don't support it
const promiseAny = <T>(promises: Promise<T>[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    let errors: any[] = [];
    let pending = promises.length;

    if (pending === 0) {
      reject(new Error('No promises to execute'));
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve)
        .catch((error) => {
          errors[index] = error;
          pending--;
          if (pending === 0) {
            reject(new Error('All strategies failed'));
          }
        });
    });
  });
};

// --- CACHE STATE ---
let cachedBalance: number | null = null;
let cachedTransactions: Transaction[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
let lastBalanceFetchTime = 0;
let lastTransactionsFetchTime = 0;

// Cache the index of the winning strategy to speed up subsequent requests
let winningStrategyIndex = -1;

const fetchData = async (endpoint: string) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  // OPTIMIZATION: If on localhost, bypass proxies as they cannot reach local network
  const isLocalhost = API_BASE_URL.startsWith('/') || API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1') || API_BASE_URL.includes('0.0.0.0');

  if (isLocalhost) {
    console.log(`[Fetch] Localhost detected, using Direct strategy only: ${fullUrl}`);
    // Only use the 'Direct' strategy (index 0)
    return strategies[0].fetch(fullUrl).catch(e => {
      console.warn('[Fetch] Local connection failed', e);
      return null;
    });
  }

  // 1. Fast Path: If we have a cached winner, try it first
  if (winningStrategyIndex !== -1) {
    try {
      console.log(`[Fetch] Using cached strategy: ${strategies[winningStrategyIndex].name}`);
      return await strategies[winningStrategyIndex].fetch(fullUrl);
    } catch (e) {
      console.warn('[Fetch] Cached strategy failed, resetting to race mode.');
      winningStrategyIndex = -1; // Fallback to race
    }
  }

  // 2. Race Mode: Try all strategies in parallel. First success wins.
  try {
    const promises = strategies.map((strategy, index) =>
      strategy.fetch(fullUrl).then(res => {
        // If this is the first one to succeed, cache it
        if (winningStrategyIndex === -1) {
          winningStrategyIndex = index;
          console.log(`[Fetch] New winning strategy: ${strategy.name}`);
        }
        return res;
      })
    );

    return await promiseAny(promises);
  } catch (aggregateError) {
    console.warn('[Fetch] All strategies failed.', aggregateError);
    return null; // Return null to trigger mock data fallback
  }
};

export const getAccountBalance = async (forceRefresh = false): Promise<number> => {
  const now = Date.now();
  // Return cached data if valid
  if (!forceRefresh && cachedBalance !== null && (now - lastBalanceFetchTime < CACHE_DURATION)) {
    return cachedBalance;
  }

  try {
    // Fetch balance directly from the API
    const data = await fetchData(`/customers/${CUSTOMER_ID}/balance`);

    if (data && data.balance !== undefined) {
      const balance = parseFloat(data.balance);

      // Update Cache
      cachedBalance = balance;
      lastBalanceFetchTime = Date.now();
      return balance;
    }

    return cachedBalance !== null ? cachedBalance : 0;
  } catch (error) {
    if (cachedBalance !== null) return cachedBalance; // Return stale cache on error
    return 0;
  }
};

export const getTransactions = async (forceRefresh = false): Promise<Transaction[]> => {
  const now = Date.now();
  // Return cached data if valid
  if (!forceRefresh && cachedTransactions !== null && (now - lastTransactionsFetchTime < CACHE_DURATION)) {
    return cachedTransactions;
  }

  try {
    const data = await fetchData(`/customers/${CUSTOMER_ID}/transactions`);

    if (!data) return cachedTransactions || MOCK_TRANSACTIONS;

    let list: any[] = [];
    if (Array.isArray(data)) list = data;
    else if (data.transactions && Array.isArray(data.transactions)) list = data.transactions;
    else if (data.data && Array.isArray(data.data)) list = data.data;

    if (list.length === 0) return cachedTransactions || MOCK_TRANSACTIONS;

    const transactions: Transaction[] = list.map((item: any, index: number) => {
      const merchantName = item.merchant_name || item.merchant || 'Unknown Merchant';
      const isDebit = item.transaction_type === 'DEBIT';
      const rawAmount = parseFloat(item.amount);
      const amount = isDebit ? -Math.abs(rawAmount) : Math.abs(rawAmount);

      return {
        id: item.transaction_id || item.id || crypto.randomUUID(),
        title: merchantName,
        subtitle: item.description || getCategory(merchantName),
        amount: amount,
        date: item.transaction_timestamp ? formatDate(item.transaction_timestamp) : generateDate(index),
        type: (amount > 0 ? 'income' : 'expense') as 'income' | 'expense',
        icon: getMerchantIcon(merchantName),
        category: getCategory(merchantName),
        timestamp: item.transaction_timestamp
      };
    });

    // Update Cache
    cachedTransactions = transactions;
    lastTransactionsFetchTime = Date.now();

    return transactions;
  } catch (error) {
    if (cachedTransactions !== null) return cachedTransactions;
    return MOCK_TRANSACTIONS;
  }
};
