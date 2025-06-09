import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Account, Macro, ExecutionResult } from '../types';

interface MonitorProps {
  accounts: Account[];
  macros: Macro[];
}

export const Monitor: React.FC<MonitorProps> = ({ accounts, macros }) => {
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'running').length,
    successfulAccounts: accounts.filter(acc => acc.status === 'completed').length,
    failedAccounts: accounts.filter(acc => acc.status === 'failed').length,
    totalSuccess: accounts.reduce((sum, acc) => sum + acc.successCount, 0),
    totalFailures: accounts.reduce((sum, acc) => sum + acc.failureCount, 0),
    successRate: accounts.length > 0 ? 
      (accounts.reduce((sum, acc) => sum + acc.successCount, 0) / 
       (accounts.reduce((sum, acc) => sum + acc.successCount + acc.failureCount, 0) || 1)) * 100 : 0,
  };

  const recentActivity = accounts
    .filter(acc => acc.lastUsed)
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 10);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      // Trigger re-render for real-time updates
      // In a real app, this would fetch fresh data
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Activity className="h-6 w-6 mr-3 text-blue-400" />
            System Monitor
          </h2>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-slate-300">
              <input
                type="checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              disabled={!isAutoRefresh}
              className="bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50"
            >
              <option value={1}>1s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalAccounts}</div>
                <div className="text-slate-300 text-sm">Total Accounts</div>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.totalSuccess}</div>
                <div className="text-slate-300 text-sm">Total Success</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{stats.totalFailures}</div>
                <div className="text-slate-300 text-sm">Total Failures</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.successRate.toFixed(1)}%</div>
                <div className="text-slate-300 text-sm">Success Rate</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        {stats.activeAccounts > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-yellow-400" />
              Currently Running ({stats.activeAccounts})
            </h3>
            <div className="space-y-2">
              {accounts
                .filter(acc => acc.status === 'running')
                .map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
                  >
                    <span className="text-white font-mono text-sm">{account.email}</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-400 text-sm">Processing...</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentActivity.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              No recent activity
            </div>
          ) : (
            recentActivity.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
              >
                <div>
                  <div className="text-white font-mono text-sm">{account.email}</div>
                  <div className="text-xs text-slate-400">
                    Last used: {account.lastUsed?.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    account.status === 'completed' ? 'text-green-400' : 
                    account.status === 'failed' ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    {account.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400">
                    ✓{account.successCount} ✗{account.failureCount}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Macro Performance */}
      {macros.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Macro Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {macros.map((macro) => (
              <div
                key={macro.id}
                className="bg-slate-700/50 rounded-lg p-4"
              >
                <h4 className="text-white font-medium mb-2">{macro.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Success Rate:</span>
                    <span className={`font-medium ${
                      macro.successRate >= 80 ? 'text-green-400' :
                      macro.successRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {macro.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Actions:</span>
                    <span className="text-white">{macro.actions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Last Used:</span>
                    <span className="text-slate-400">
                      {macro.lastUsed ? macro.lastUsed.toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};