import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Target, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { Account, Macro, ExecutionResult } from '../types';
import { VotingBot } from '../services/VotingBot';

interface ExecutionManagerProps {
  accounts: Account[];
  macros: Macro[];
  onAccountsUpdate: (accounts: Account[]) => void;
}

export const ExecutionManager: React.FC<ExecutionManagerProps> = ({ 
  accounts, 
  macros, 
  onAccountsUpdate 
}) => {
  const [selectedMacro, setSelectedMacro] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [delayBetweenAccounts, setDelayBetweenAccounts] = useState(5);
  const [randomizeDelay, setRandomizeDelay] = useState(true);
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [executionMode, setExecutionMode] = useState<'sequential' | 'selected'>('sequential');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [votingBot, setVotingBot] = useState<VotingBot | null>(null);
  const [globalPassword, setGlobalPassword] = useState('Clanh2o1!2');

  // Sort accounts by email for sequential processing (lowest number first)
  const sortedAccounts = [...accounts].sort((a, b) => {
    const getEmailNumber = (email: string) => {
      const match = email.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    return getEmailNumber(a.email) - getEmailNumber(b.email);
  });

  const startExecution = async () => {
    if (!selectedMacro) return;

    const accountsToProcess = executionMode === 'sequential' 
      ? sortedAccounts 
      : accounts.filter(acc => selectedAccounts.includes(acc.id));

    if (accountsToProcess.length === 0) return;

    setIsExecuting(true);
    setCurrentAccountIndex(0);
    
    const macro = macros.find(m => m.id === selectedMacro);
    if (!macro) return;

    // Initialize voting bot
    const bot = new VotingBot({
      zoom: 60,
      maximized: true,
      incognito: true,
      viewport: { width: 1920, height: 1080 }
    });
    setVotingBot(bot);

    // Process accounts sequentially
    for (let i = 0; i < accountsToProcess.length; i++) {
      if (!isExecuting) break;

      const account = accountsToProcess[i];
      setCurrentAccountIndex(i);

      // Update account status to running
      const updatedAccounts = accounts.map(acc => 
        acc.id === account.id ? { ...acc, status: 'running' as const } : acc
      );
      onAccountsUpdate(updatedAccounts);

      try {
        console.log(`Processing account ${i + 1}/${accountsToProcess.length}: ${account.email}`);
        
        // Login with account
        const loginSuccess = await bot.login(account.email, globalPassword);
        
        if (!loginSuccess) {
          throw new Error('Login failed');
        }

        // Navigate to target website if specified
        if (macro.website) {
          await bot.navigateToSite(macro.website);
        }

        // Execute the macro
        const macroSuccess = await bot.executeMacro(macro);
        
        if (!macroSuccess) {
          throw new Error('Macro execution failed');
        }

        // Close session
        await bot.closeSession();

        // Add delay between accounts
        const delay = randomizeDelay 
          ? delayBetweenAccounts * 1000 + Math.random() * 3000
          : delayBetweenAccounts * 1000;
        
        await new Promise(resolve => setTimeout(resolve, delay));

        const result: ExecutionResult = {
          accountId: account.id,
          macroId: selectedMacro,
          success: true,
          timestamp: new Date(),
          duration: Math.random() * 8000 + 3000,
        };

        setExecutionResults(prev => [...prev, result]);

        // Update account status and counters
        const finalAccounts = accounts.map(acc => {
          if (acc.id === account.id) {
            return {
              ...acc,
              status: 'completed' as const,
              successCount: acc.successCount + 1,
              lastUsed: new Date(),
            };
          }
          return acc;
        });
        onAccountsUpdate(finalAccounts);

      } catch (error) {
        console.error('Execution error:', error);
        
        // Close session on error
        await bot.closeSession();
        
        const result: ExecutionResult = {
          accountId: account.id,
          macroId: selectedMacro,
          success: false,
          timestamp: new Date(),
          duration: Math.random() * 3000 + 1000,
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        setExecutionResults(prev => [...prev, result]);
        
        // Mark account as failed
        const failedAccounts = accounts.map(acc => {
          if (acc.id === account.id) {
            return {
              ...acc,
              status: 'failed' as const,
              failureCount: acc.failureCount + 1,
              lastUsed: new Date(),
            };
          }
          return acc;
        });
        onAccountsUpdate(failedAccounts);
      }
    }

    await bot.shutdown();
    setIsExecuting(false);
    setCurrentAccountIndex(0);
    setVotingBot(null);
  };

  const stopExecution = async () => {
    setIsExecuting(false);
    setCurrentAccountIndex(0);
    
    if (votingBot) {
      await votingBot.shutdown();
      setVotingBot(null);
    }
    
    // Reset running accounts to idle
    const updatedAccounts = accounts.map(acc => 
      acc.status === 'running' ? { ...acc, status: 'idle' as const } : acc
    );
    onAccountsUpdate(updatedAccounts);
  };

  const selectAllAccounts = () => {
    setSelectedAccounts(accounts.map(acc => acc.id));
  };

  const clearSelection = () => {
    setSelectedAccounts([]);
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const resetResults = () => {
    setExecutionResults([]);
  };

  const getCurrentAccount = () => {
    const accountsToProcess = executionMode === 'sequential' 
      ? sortedAccounts 
      : accounts.filter(acc => selectedAccounts.includes(acc.id));
    return accountsToProcess[currentAccountIndex];
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Play className="h-6 w-6 mr-3 text-blue-400" />
          Execution Manager
        </h2>

        {/* Warning */}
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">
              Real browser automation active - accounts will be processed with actual voting actions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Macro
              </label>
              <select
                value={selectedMacro}
                onChange={(e) => setSelectedMacro(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a macro...</option>
                {macros.map(macro => (
                  <option key={macro.id} value={macro.id}>
                    {macro.name} ({macro.actions.length} actions)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Global Password
              </label>
              <input
                type="password"
                value={globalPassword}
                onChange={(e) => setGlobalPassword(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Execution Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="executionMode"
                    value="sequential"
                    checked={executionMode === 'sequential'}
                    onChange={(e) => setExecutionMode(e.target.value as 'sequential')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300">Sequential (Process all emails in order)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="executionMode"
                    value="selected"
                    checked={executionMode === 'selected'}
                    onChange={(e) => setExecutionMode(e.target.value as 'selected')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300">Selected accounts only</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Delay Between Accounts (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={delayBetweenAccounts}
                  onChange={(e) => setDelayBetweenAccounts(parseInt(e.target.value))}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={randomizeDelay}
                    onChange={(e) => setRandomizeDelay(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Randomize delay</span>
                </label>
              </div>
            </div>

            {executionMode === 'selected' && (
              <div className="flex space-x-3">
                <button
                  onClick={selectAllAccounts}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={isExecuting ? stopExecution : startExecution}
                disabled={!selectedMacro || (executionMode === 'selected' && selectedAccounts.length === 0) || (executionMode === 'sequential' && accounts.length === 0)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isExecuting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white'
                }`}
              >
                {isExecuting ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isExecuting ? 'Stop Execution' : 'Start Execution'}</span>
              </button>
              
              {executionResults.length > 0 && (
                <button
                  onClick={resetResults}
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Account Selection/Progress */}
          <div className="space-y-4">
            {executionMode === 'sequential' ? (
              <div>
                <h3 className="text-white font-medium mb-3">
                  Sequential Processing ({sortedAccounts.length} accounts)
                </h3>
                {isExecuting && (
                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">Currently Processing:</span>
                    </div>
                    <div className="text-white font-mono text-sm">
                      {getCurrentAccount()?.email || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Account {currentAccountIndex + 1} of {sortedAccounts.length}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentAccountIndex + 1) / sortedAccounts.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="bg-slate-900/50 rounded-lg p-4 h-64 overflow-y-auto">
                  {sortedAccounts.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">
                      No accounts available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedAccounts.map((account, index) => (
                        <div
                          key={account.id}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                            isExecuting && index === currentAccountIndex 
                              ? 'bg-blue-700/50 border border-blue-500/50' 
                              : 'hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-xs text-slate-400 w-8">#{index + 1}</div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-mono">{account.email}</div>
                              <div className="text-xs text-slate-400">
                                Status: {account.status} | ✓{account.successCount} ✗{account.failureCount}
                              </div>
                            </div>
                          </div>
                          {isExecuting && index === currentAccountIndex && (
                            <ArrowRight className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-white font-medium mb-3">
                  Select Accounts ({selectedAccounts.length}/{accounts.length})
                </h3>
                <div className="bg-slate-900/50 rounded-lg p-4 h-64 overflow-y-auto">
                  {accounts.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">
                      No accounts available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accounts.map((account) => (
                        <label
                          key={account.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={() => toggleAccountSelection(account.id)}
                            className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm font-mono">{account.email}</div>
                            <div className="text-xs text-slate-400">
                              Status: {account.status} | ✓{account.successCount} ✗{account.failureCount}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution Results */}
      {executionResults.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-400" />
            Execution Results ({executionResults.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {executionResults.map((result, index) => {
              const account = accounts.find(acc => acc.id === result.accountId);
              const macro = macros.find(m => m.id === result.macroId);
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'
                  }`}
                >
                  <div>
                    <div className="text-white font-mono text-sm">{account?.email}</div>
                    <div className="text-xs text-slate-400">
                      {macro?.name} • {(result.duration / 1000).toFixed(1)}s • {result.timestamp.toLocaleTimeString()}
                    </div>
                    {result.error && (
                      <div className="text-xs text-red-400 mt-1">{result.error}</div>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};