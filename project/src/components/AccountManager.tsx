import React, { useState, useRef } from 'react';
import { Upload, Users, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Account } from '../types';

interface AccountManagerProps {
  accounts: Account[];
  onAccountsUpdate: (accounts: Account[]) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ accounts, onAccountsUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const emails = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes('@'));

      const newAccounts: Account[] = emails.map((email, index) => ({
        id: `acc_${Date.now()}_${index}`,
        email,
        status: 'idle',
        successCount: 0,
        failureCount: 0,
      }));

      onAccountsUpdate([...accounts, ...newAccounts]);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeAccount = (accountId: string) => {
    onAccountsUpdate(accounts.filter(acc => acc.id !== accountId));
  };

  const clearAllAccounts = () => {
    onAccountsUpdate([]);
  };

  const getStatusIcon = (status: Account['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Users className="h-6 w-6 mr-3 text-green-400" />
          Account Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{accounts.length}</div>
            <div className="text-slate-300">Total Accounts</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {accounts.reduce((sum, acc) => sum + acc.successCount, 0)}
            </div>
            <div className="text-slate-300">Total Success</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {accounts.reduce((sum, acc) => sum + acc.failureCount, 0)}
            </div>
            <div className="text-slate-300">Total Failures</div>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>{isLoading ? 'Loading...' : 'Upload Email List'}</span>
          </button>
          
          {accounts.length > 0 && (
            <button
              onClick={clearAllAccounts}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Instructions:</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Upload a .txt file with one email per line</li>
            <li>• All accounts will use the password from PasswordsForAll.txt</li>
            <li>• Duplicate emails will be filtered out automatically</li>
          </ul>
        </div>
      </div>

      {accounts.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Account List</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(account.status)}
                  <span className="text-white font-mono text-sm">{account.email}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-slate-300">
                    ✓{account.successCount} ✗{account.failureCount}
                  </div>
                  <button
                    onClick={() => removeAccount(account.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};