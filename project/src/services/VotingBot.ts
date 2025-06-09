import { BrowserManager } from './BrowserManager';
import { MacroEngine } from './MacroEngine';
import { Account, Macro, BrowserSettings } from '../types';

export class VotingBot {
  private browserManager: BrowserManager;
  private isRunning: boolean = false;
  private currentSession: string | null = null;

  constructor(settings: BrowserSettings) {
    this.browserManager = new BrowserManager(settings);
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const sessionId = `session_${Date.now()}`;
      const page = await this.browserManager.createSession(sessionId, email);
      this.currentSession = sessionId;

      // Navigate to login page (this would be site-specific)
      await page.goto('https://example.com/login');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Find and fill email field
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[id="email"]',
        'input[placeholder*="email" i]'
      ];

      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          await page.fill(selector, email, { timeout: 2000 });
          emailFilled = true;
          break;
        } catch (error) {
          continue;
        }
      }

      if (!emailFilled) {
        throw new Error('Could not find email input field');
      }

      // Find and fill password field
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[id="password"]'
      ];

      let passwordFilled = false;
      for (const selector of passwordSelectors) {
        try {
          await page.fill(selector, password, { timeout: 2000 });
          passwordFilled = true;
          break;
        } catch (error) {
          continue;
        }
      }

      if (!passwordFilled) {
        throw new Error('Could not find password input field');
      }

      // Find and click login button
      const loginButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign in")',
        'button:has-text("Log in")',
        '[role="button"]:has-text("Login")'
      ];

      let loginClicked = false;
      for (const selector of loginButtonSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          loginClicked = true;
          break;
        } catch (error) {
          continue;
        }
      }

      if (!loginClicked) {
        throw new Error('Could not find login button');
      }

      // Wait for navigation or error
      await page.waitForTimeout(3000);

      // Check if login was successful (look for common error indicators)
      const errorSelectors = [
        '.error',
        '.alert-danger',
        '[class*="error"]',
        '[class*="invalid"]',
        'text="Invalid"',
        'text="Error"'
      ];

      for (const selector of errorSelectors) {
        try {
          const errorElement = await page.locator(selector).first();
          if (await errorElement.isVisible()) {
            throw new Error('Login failed - invalid credentials');
          }
        } catch (error) {
          // Error element not found, continue
        }
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      if (this.currentSession) {
        await this.browserManager.closeSession(this.currentSession);
        this.currentSession = null;
      }
      return false;
    }
  }

  async executeMacro(macro: Macro): Promise<boolean> {
    if (!this.currentSession) {
      throw new Error('No active session - login first');
    }

    const page = this.browserManager.getPage(this.currentSession);
    if (!page) {
      throw new Error('No active page found');
    }

    const macroEngine = new MacroEngine(page);
    return await macroEngine.executeActions(macro.actions);
  }

  async startRecording(): Promise<MacroEngine> {
    if (!this.currentSession) {
      throw new Error('No active session - login first');
    }

    const page = this.browserManager.getPage(this.currentSession);
    if (!page) {
      throw new Error('No active page found');
    }

    const macroEngine = new MacroEngine(page);
    await macroEngine.startRecording();
    return macroEngine;
  }

  async navigateToSite(url: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session - login first');
    }

    const page = this.browserManager.getPage(this.currentSession);
    if (!page) {
      throw new Error('No active page found');
    }

    await page.goto(url);
    await page.waitForLoadState('networkidle');
  }

  async closeSession(): Promise<void> {
    if (this.currentSession) {
      await this.browserManager.closeSession(this.currentSession);
      this.currentSession = null;
    }
  }

  async shutdown(): Promise<void> {
    await this.browserManager.closeAll();
    this.isRunning = false;
  }

  isSessionActive(): boolean {
    return this.currentSession !== null;
  }
}