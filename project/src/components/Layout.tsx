import React from 'react';
import { Bot, Users, PlayCircle, Settings, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'record', label: 'Record', icon: Bot },
    { id: 'execute', label: 'Execute', icon: PlayCircle },
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Bot className="h-8 w-8 text-green-400" />
              <h1 className="text-xl font-bold text-white">VoteBot Pro</h1>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};