import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { BrowserSettings } from '../types';

export class BrowserManager {
  private browser: Browser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();
  private settings: BrowserSettings;

  constructor(settings: BrowserSettings) {
    this.settings = settings;
  }

  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: false, // Show browser for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        `--window-size=${this.settings.viewport.width},${this.settings.viewport.height}`,
      ],
    });
  }

  async createSession(sessionId: string, email: string): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    // Create new incognito context for each session
    const context = await this.browser!.newContext({
      viewport: this.settings.viewport,
      userAgent: this.settings.userAgent,
      ignoreHTTPSErrors: true,
    });

    // Create new page
    const page = await context.newPage();
    
    // Set zoom level
    await page.evaluate((zoom) => {
      document.body.style.zoom = `${zoom}%`;
    }, this.settings.zoom);

    this.contexts.set(sessionId, context);
    this.pages.set(sessionId, page);

    return page;
  }

  async closeSession(sessionId: string): Promise<void> {
    const page = this.pages.get(sessionId);
    const context = this.contexts.get(sessionId);

    if (page) {
      await page.close();
      this.pages.delete(sessionId);
    }

    if (context) {
      await context.close();
      this.contexts.delete(sessionId);
    }
  }

  async closeAll(): Promise<void> {
    for (const [sessionId] of this.pages) {
      await this.closeSession(sessionId);
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getPage(sessionId: string): Page | undefined {
    return this.pages.get(sessionId);
  }
}