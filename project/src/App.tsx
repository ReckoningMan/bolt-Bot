import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AccountManager } from './components/AccountManager';
import { MacroRecorder } from './components/MacroRecorder';
import { ExecutionManager } from './components/ExecutionManager';
import { Monitor } from './components/Monitor';
import { Settings } from './components/Settings';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Account, Macro, BrowserSettings } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('accounts');
  
  const [accounts, setAccounts] = useLocalStorage<Account[]>('votebot-accounts', []);
  const [macros, setMacros] = useLocalStorage<Macro[]>('votebot-macros', []);
  const [settings, setSettings] = useLocalStorage<BrowserSettings>('votebot-settings', {
    zoom: 60,
    maximized: true,
    incognito: true,
    viewport: { width: 1920, height: 1080 },
  });

  const handleMacroSave = (macro: Macro) => {
    setMacros(prev => [...prev, macro]);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'accounts':
        return (
          <AccountManager 
            accounts={accounts} 
            onAccountsUpdate={setAccounts} 
          />
        );
      case 'record':
        return (
          <MacroRecorder 
            macros={macros} 
            onMacroSave={handleMacroSave} 
          />
        );
      case 'execute':
        return (
          <ExecutionManager 
            accounts={accounts} 
            macros={macros} 
            onAccountsUpdate={setAccounts} 
          />
        );
      case 'monitor':
        return (
          <Monitor 
            accounts={accounts} 
            macros={macros} 
          />
        );
      case 'settings':
        return (
          <Settings 
            settings={settings} 
            onSettingsUpdate={setSettings} 
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
}

export default App;