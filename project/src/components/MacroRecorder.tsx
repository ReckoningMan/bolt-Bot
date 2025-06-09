import React, { useState, useEffect } from 'react';
import { SwordIcon as Record, Square, Play, Save, Eye, Monitor, Globe, AlertCircle } from 'lucide-react';
import { Macro, RecordedAction } from '../types';
import { VotingBot } from '../services/VotingBot';
import { MacroEngine } from '../services/MacroEngine';

interface MacroRecorderProps {
  macros: Macro[];
  onMacroSave: (macro: Macro) => void;
}

export const MacroRecorder: React.FC<MacroRecorderProps> = ({ macros, onMacroSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [macroName, setMacroName] = useState('');
  const [macroDescription, setMacroDescription] = useState('');
  const [targetWebsite, setTargetWebsite] = useState('');
  const [votingBot, setVotingBot] = useState<VotingBot | null>(null);
  const [macroEngine, setMacroEngine] = useState<MacroEngine | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<string>('Ready');

  useEffect(() => {
    // Initialize voting bot
    const bot = new VotingBot({
      zoom: 60,
      maximized: true,
      incognito: true,
      viewport: { width: 1920, height: 1080 }
    });
    setVotingBot(bot);

    return () => {
      bot.shutdown();
    };
  }, []);

  const connectToBrowser = async () => {
    if (!votingBot) return;

    try {
      setStatus('Connecting to browser...');
      
      // For demo, we'll use test credentials
      const success = await votingBot.login('test@example.com', 'password123');
      
      if (success) {
        setIsConnected(true);
        setStatus('Connected - Ready to record');
      } else {
        setStatus('Connection failed - Check credentials');
      }
    } catch (error) {
      console.error('Browser connection failed:', error);
      setStatus('Connection error');
    }
  };

  const navigateToSite = async () => {
    if (!votingBot || !targetWebsite) return;

    try {
      setStatus('Navigating to website...');
      await votingBot.navigateToSite(targetWebsite);
      setStatus('Ready to record on ' + targetWebsite);
    } catch (error) {
      console.error('Navigation failed:', error);
      setStatus('Navigation failed');
    }
  };

  const startRecording = async () => {
    if (!votingBot || !isConnected) return;

    try {
      setStatus('Starting recording...');
      const engine = await votingBot.startRecording();
      setMacroEngine(engine);
      setIsRecording(true);
      setRecordedActions([]);
      setStatus('Recording... Perform your voting actions');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setStatus('Recording failed to start');
    }
  };

  const stopRecording = () => {
    if (!macroEngine) return;

    try {
      const actions = macroEngine.stopRecording();
      setRecordedActions(actions);
      setIsRecording(false);
      setMacroEngine(null);
      setStatus(`Recording stopped - ${actions.length} actions captured`);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setStatus('Failed to stop recording');
    }
  };

  const saveMacro = () => {
    if (!macroName || recordedActions.length === 0) return;

    const newMacro: Macro = {
      id: `macro_${Date.now()}`,
      name: macroName,
      description: macroDescription,
      website: targetWebsite,
      actions: recordedActions,
      createdAt: new Date(),
      successRate: 0,
    };

    onMacroSave(newMacro);
    
    // Reset form
    setMacroName('');
    setMacroDescription('');
    setTargetWebsite('');
    setRecordedActions([]);
    setStatus('Macro saved successfully');
  };

  const testMacro = async () => {
    if (!votingBot || !isConnected || recordedActions.length === 0) return;

    try {
      setStatus('Testing macro...');
      
      const testMacro: Macro = {
        id: 'test',
        name: 'Test Macro',
        description: 'Testing recorded actions',
        website: targetWebsite,
        actions: recordedActions,
        createdAt: new Date(),
        successRate: 0,
      };

      const success = await votingBot.executeMacro(testMacro);
      setStatus(success ? 'Macro test successful' : 'Macro test failed');
    } catch (error) {
      console.error('Macro test failed:', error);
      setStatus('Macro test error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Record className="h-6 w-6 mr-3 text-red-400" />
          Macro Recorder
        </h2>

        {/* Status Bar */}
        <div className={`mb-6 p-3 rounded-lg border ${
          isConnected ? 'bg-green-900/30 border-green-700/50' : 'bg-yellow-900/30 border-yellow-700/50'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-white font-medium">Status: {status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Website URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={targetWebsite}
                  onChange={(e) => setTargetWebsite(e.target.value)}
                  placeholder="https://coingecko.com/en/coins/bitcoin"
                  className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={navigateToSite}
                  disabled={!isConnected || !targetWebsite}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Macro Name
              </label>
              <input
                type="text"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                placeholder="e.g., CoinGecko Star Vote"
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={macroDescription}
                onChange={(e) => setMacroDescription(e.target.value)}
                placeholder="Describe what this macro does..."
                rows={3}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              {!isConnected && (
                <button
                  onClick={connectToBrowser}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Connect Browser
                </button>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!isConnected}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white'
                  }`}
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Record className="h-4 w-4" />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>

                {recordedActions.length > 0 && (
                  <button
                    onClick={testMacro}
                    disabled={!isConnected}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
                Instructions:
              </h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>1. Connect browser and navigate to target site</li>
                <li>2. Start recording and perform voting actions</li>
                <li>3. Stop recording and test the macro</li>
                <li>4. Save the macro for batch execution</li>
              </ul>
            </div>
          </div>

          {/* Action List */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Recorded Actions ({recordedActions.length})</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 h-80 overflow-y-auto">
              {recordedActions.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  {isRecording ? 'Perform actions to record them...' : 'No actions recorded yet'}
                </div>
              ) : (
                <div className="space-y-2">
                  {recordedActions.map((action, index) => (
                    <div
                      key={action.id}
                      className="bg-slate-700/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {index + 1}. {action.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 mt-1">
                        {action.description}
                      </div>
                      {action.value && (
                        <div className="text-xs text-blue-400 mt-1">
                          Value: "{action.value}"
                        </div>
                      )}
                      {action.coordinates && (
                        <div className="text-xs text-slate-400 mt-1">
                          Position: {action.coordinates.x}, {action.coordinates.y}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {recordedActions.length > 0 && (
              <button
                onClick={saveMacro}
                disabled={!macroName}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Macro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saved Macros */}
      {macros.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Monitor className="h-5 w-5 mr-2 text-blue-400" />
            Saved Macros ({macros.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {macros.map((macro) => (
              <div
                key={macro.id}
                className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors"
              >
                <h4 className="text-white font-medium mb-2">{macro.name}</h4>
                <p className="text-slate-300 text-sm mb-3">{macro.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{macro.actions.length} actions</span>
                  <span>{macro.successRate.toFixed(1)}% success</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 truncate">
                  {macro.website}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};