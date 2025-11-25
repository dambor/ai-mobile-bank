
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  WALLET = 'WALLET',
  CHAT = 'CHAT',
  HISTORY = 'HISTORY',
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  icon: string;
  category: string;
  timestamp?: string;
}

export interface Card {
  id: string;
  last4: string;
  expiry: string;
  balance: number;
  type: 'visa' | 'mastercard';
  color: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  isError?: boolean;
}

export interface ChatPayload {
  output_type: string;
  input_type: string;
  input_value: string;
  session_id: string;
  tweaks?: Record<string, any>;
}
