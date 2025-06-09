import React, { useState } from 'react';
import { Settings as SettingsIcon, Monitor, Globe, Shield, Zap } from 'lucide-react';
import { BrowserSettings } from '../types';

interface SettingsProps {
  settings: BrowserSettings;
  onSettingsUpdate: (settings: BrowserSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsUpdate }) => {
  const [localSettings, setLocalSettings] = useState<BrowserSettings>(settings);

  const handleSave = () => {
    onSettingsUpdate(localSettings);
  };

  const handleReset = () => {
    const defaultSettings: BrowserSettings = {
      zoom: 60,
      maximized: true,
      incognito: true,
      viewport: { width: 1920, height: 1080 },
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <SettingsIcon className="h-6 w-6 mr-3 text-green-400" />
          Bot Settings
        </h2>

        <div className="space-y-8">
          {/* Browser Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-400" />
              Browser Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Browser Zoom ({localSettings.zoom}%)
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="5"
                    value={localSettings.zoom}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      zoom: parseInt(e.target.value) 
                    }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>25%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={localSettings.maximized}
                      onChange={(e) => setLocalSettings(prev => ({ 
                        ...prev, 
                        maximized: e.target.checked 
                      }))}
                      className="rounded border-slate-600 bg-slate-700 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-slate-300">Maximize browser window</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={localSettings.incognito}
                      onChange={(e) => setLocalSettings(prev => ({ 
                        ...prev, 
                        incognito: e.target.checked 
                      }))}
                      className="rounded border-slate-600 bg-slate-700 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-slate-300">Use incognito/private browsing</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Viewport Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Width"
                      value={localSettings.viewport.width}
                      onChange={(e) => setLocalSettings(prev => ({ 
                        ...prev, 
                        viewport: { 
                          ...prev.viewport, 
                          width: parseInt(e.target.value) || 1920 
                        }
                      }))}
                      className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={localSettings.viewport.height}
                      onChange={(e) => setLocalSettings(prev => ({ 
                        ...prev, 
                        viewport: { 
                          ...prev.viewport, 
                          height: parseInt(e.target.value) || 1080 
                        }
                      }))}
                      className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Custom User Agent (Optional)
                  </label>
                  <textarea
                    value={localSettings.userAgent || ''}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      userAgent: e.target.value 
                    }))}
                    placeholder="Leave empty for default user agent"
                    rows={3}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-yellow-400" />
              Security & Anti-Detection
            </h3>
            
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-slate-600 bg-slate-700 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-slate-300">Randomize mouse movements</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-slate-600 bg-slate-700 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-slate-300">Variable action delays</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-slate-600 bg-slate-700 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-slate-300">Clear cookies between sessions</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="rounded border-slate-600 bg-slate-700 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-slate-300">Use proxy rotation</span>
                </label>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-400" />
              Performance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Concurrent Browser Instances
                </label>
                <select className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="1">1 (Recommended)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Element Detection Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  defaultValue={10}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Password File Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-red-400" />
              Account Management
            </h3>
            
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Global Password (from PasswordsForAll.txt)
                </label>
                <input
                  type="password"
                  placeholder="Clanh2o1!2"
                  readOnly
                  className="w-full bg-slate-800 text-slate-400 border border-slate-600 rounded-lg px-3 py-2 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  This password will be used for all accounts. Modify PasswordsForAll.txt to change.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-8 pt-6 border-t border-slate-700">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Save Settings
          </button>
          <button
            onClick={handleReset}
            className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};