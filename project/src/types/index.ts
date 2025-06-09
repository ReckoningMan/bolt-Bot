export interface Account {
  id: string;
  email: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastUsed?: Date;
  successCount: number;
  failureCount: number;
}

export interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'wait' | 'navigate' | 'scroll';
  timestamp: number;
  element: ElementSelector;
  value?: string;
  coordinates?: { x: number; y: number };
  description: string;
}

export interface ElementSelector {
  css?: string;
  xpath?: string;
  text?: string;
  id?: string;
  className?: string;
  coordinates?: { x: number; y: number };
  screenshot?: string;
}

export interface Macro {
  id: string;
  name: string;
  description: string;
  website: string;
  actions: RecordedAction[];
  createdAt: Date;
  lastUsed?: Date;
  successRate: number;
}

export interface ExecutionResult {
  accountId: string;
  macroId: string;
  success: boolean;
  error?: string;
  timestamp: Date;
  duration: number;
}

export interface BrowserSettings {
  zoom: number;
  maximized: boolean;
  incognito: boolean;
  userAgent?: string;
  viewport: { width: number; height: number };
}
</parameter>