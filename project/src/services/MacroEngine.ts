import { Page } from 'playwright';
import { RecordedAction, ElementSelector } from '../types';

export class MacroEngine {
  private page: Page;
  private isRecording: boolean = false;
  private recordedActions: RecordedAction[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async startRecording(): Promise<void> {
    this.isRecording = true;
    this.recordedActions = [];

    // Inject recording script into page
    await this.page.addInitScript(() => {
      let actionCounter = 0;
      
      const generateSelector = (element: Element): any => {
        const rect = element.getBoundingClientRect();
        return {
          css: this.getCSSSelector(element),
          xpath: this.getXPath(element),
          text: element.textContent?.trim() || '',
          coordinates: { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          }
        };
      };

      const getCSSSelector = (element: Element): string => {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c).join('.');
          if (classes) return `.${classes}`;
        }
        return element.tagName.toLowerCase();
      };

      const getXPath = (element: Element): string => {
        if (element.id) return `//*[@id="${element.id}"]`;
        
        let path = '';
        let current = element;
        
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let selector = current.nodeName.toLowerCase();
          if (current.id) {
            selector += `[@id="${current.id}"]`;
            path = '//' + selector + path;
            break;
          } else {
            let sibling = current;
            let nth = 1;
            while (sibling = sibling.previousElementSibling) {
              if (sibling.nodeName.toLowerCase() === selector.split('[')[0]) nth++;
            }
            if (nth > 1) selector += `[${nth}]`;
          }
          path = '/' + selector + path;
          current = current.parentElement;
        }
        
        return path;
      };

      // Record clicks
      document.addEventListener('click', (event) => {
        const target = event.target as Element;
        const action = {
          id: `action_${++actionCounter}`,
          type: 'click',
          timestamp: Date.now(),
          element: generateSelector(target),
          description: `Click on ${target.tagName.toLowerCase()}${target.id ? '#' + target.id : ''}${target.className ? '.' + target.className.split(' ').join('.') : ''}`
        };
        
        console.log('MACRO_RECORD:', JSON.stringify(action));
        event.preventDefault();
      }, true);

      // Record typing
      document.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        const action = {
          id: `action_${++actionCounter}`,
          type: 'type',
          timestamp: Date.now(),
          element: generateSelector(target),
          value: target.value,
          description: `Type "${target.value}" into ${target.tagName.toLowerCase()}`
        };
        
        console.log('MACRO_RECORD:', JSON.stringify(action));
      });

      // Record scrolling
      let scrollTimeout: NodeJS.Timeout;
      document.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const action = {
            id: `action_${++actionCounter}`,
            type: 'scroll',
            timestamp: Date.now(),
            element: { css: 'body' },
            coordinates: { x: window.scrollX, y: window.scrollY },
            description: `Scroll to position ${window.scrollX}, ${window.scrollY}`
          };
          
          console.log('MACRO_RECORD:', JSON.stringify(action));
        }, 500);
      });
    });

    // Listen for recorded actions
    this.page.on('console', (msg) => {
      if (msg.text().startsWith('MACRO_RECORD:')) {
        try {
          const actionData = JSON.parse(msg.text().replace('MACRO_RECORD:', ''));
          this.recordedActions.push(actionData);
        } catch (error) {
          console.error('Failed to parse recorded action:', error);
        }
      }
    });
  }

  stopRecording(): RecordedAction[] {
    this.isRecording = false;
    return [...this.recordedActions];
  }

  async executeActions(actions: RecordedAction[]): Promise<boolean> {
    try {
      for (const action of actions) {
        await this.executeAction(action);
        // Human-like delay between actions
        await this.randomDelay(500, 2000);
      }
      return true;
    } catch (error) {
      console.error('Macro execution failed:', error);
      return false;
    }
  }

  private async executeAction(action: RecordedAction): Promise<void> {
    switch (action.type) {
      case 'click':
        await this.clickElement(action.element);
        break;
      case 'type':
        await this.typeText(action.element, action.value || '');
        break;
      case 'scroll':
        if (action.coordinates) {
          await this.page.evaluate(({ x, y }) => {
            window.scrollTo(x, y);
          }, action.coordinates);
        }
        break;
      case 'wait':
        await this.page.waitForTimeout(parseInt(action.value || '1000'));
        break;
      case 'navigate':
        await this.page.goto(action.value || '');
        break;
    }
  }

  private async clickElement(selector: ElementSelector): Promise<void> {
    try {
      // Try CSS selector first
      if (selector.css) {
        await this.page.click(selector.css, { timeout: 5000 });
        return;
      }

      // Try XPath
      if (selector.xpath) {
        const element = await this.page.locator(`xpath=${selector.xpath}`).first();
        await element.click({ timeout: 5000 });
        return;
      }

      // Try coordinates as fallback
      if (selector.coordinates) {
        await this.page.mouse.click(selector.coordinates.x, selector.coordinates.y);
        return;
      }

      throw new Error('No valid selector found');
    } catch (error) {
      console.error('Failed to click element:', error);
      throw error;
    }
  }

  private async typeText(selector: ElementSelector, text: string): Promise<void> {
    try {
      // Try CSS selector first
      if (selector.css) {
        await this.page.fill(selector.css, text);
        return;
      }

      // Try XPath
      if (selector.xpath) {
        const element = await this.page.locator(`xpath=${selector.xpath}`).first();
        await element.fill(text);
        return;
      }

      throw new Error('No valid selector found for typing');
    } catch (error) {
      console.error('Failed to type text:', error);
      throw error;
    }
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await this.page.waitForTimeout(delay);
  }
}