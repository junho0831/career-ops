import { chromium } from 'playwright';

export async function connectBrowser() {
  const response = await fetch('http://127.0.0.1:9222/json/version');
  if (!response.ok) {
    throw new Error(`Failed to read CDP endpoint: ${response.status}`);
  }

  const payload = await response.json();
  const wsEndpoint = payload.webSocketDebuggerUrl;
  if (!wsEndpoint) {
    throw new Error('webSocketDebuggerUrl not found in /json/version');
  }

  return chromium.connectOverCDP(wsEndpoint);
}

export async function getDefaultContext() {
  const browser = await connectBrowser();
  const context = browser.contexts()[0];
  if (!context) {
    throw new Error('No browser context available');
  }
  return { browser, context };
}
