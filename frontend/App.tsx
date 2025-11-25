import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Wallet } from './components/Wallet';
import { ChatBot } from './components/ChatBot';
import { TransactionHistory } from './components/TransactionHistory';
import { Tab } from './types';

import { DeviceFrame } from './components/DeviceFrame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard onChangeTab={setActiveTab} />;
      case Tab.WALLET:
        return <Wallet />;
      case Tab.CHAT:
        return <ChatBot />;
      case Tab.HISTORY:
        return <TransactionHistory />;
      default:
        return <Dashboard onChangeTab={setActiveTab} />;
    }
  };

  return (
    <DeviceFrame>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </DeviceFrame>
  );
};

export default App;