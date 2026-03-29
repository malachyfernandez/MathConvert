import puppeteer from 'puppeteer';

const baseUrl = process.env.DIALOG_DEBUG_BASE_URL || 'http://127.0.0.1:8081';
const defaultModes = ['raw-static', 'raw-inputs', 'convex-static', 'convex-inputs', 'current', 'home-page', 'cache-loop'];
const modes = process.env.DIALOG_DEBUG_MODES
  ? process.env.DIALOG_DEBUG_MODES.split(',').map((mode) => mode.trim()).filter(Boolean)
  : defaultModes;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickByExactText(page, text) {
  const clickTarget = await page.evaluate((targetText) => {
    const elements = Array.from(document.querySelectorAll('*'));
    const match = elements.find((element) => {
      const content = element.textContent?.trim();
      if (content !== targetText) {
        return false;
      }

      const childWithSameText = Array.from(element.children).some((child) => child.textContent?.trim() === targetText);
      return !childWithSameText;
    });

    if (!match) {
      return null;
    }

    const clickable = match.closest('button,[role="button"],a,[tabindex]') || match.parentElement || match;

    if (!clickable) {
      return null;
    }

    const rect = clickable.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return null;
    }

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      tagName: clickable.tagName,
      text: clickable.textContent?.trim() || '',
    };
  }, text);

  if (!clickTarget) {
    throw new Error(`Could not find clickable text: ${text}`);
  }

  await page.mouse.click(clickTarget.x, clickTarget.y);
  return clickTarget;
}

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
const pageErrors = [];
const consoleMessages = [];

function takeNewConsoleMessages(startIndex) {
  return consoleMessages.slice(startIndex);
}

page.on('pageerror', (error) => {
  const message = String(error?.stack || error?.message || error);
  pageErrors.push(message);
  console.error('[pageerror]', message);
});

page.on('console', (msg) => {
  const text = msg.text();
  consoleMessages.push(`[${msg.type()}] ${text}`);
  console.log(`[browser:${msg.type()}]`, text);
});

try {
  for (const mode of modes) {
    const targetUrl = `${baseUrl}/dialog-debug?mode=${encodeURIComponent(mode)}&hideModeSelector=1`;
    console.log(`\n[repro] testing mode: ${mode}`);
    console.log('[repro] opening', targetUrl);
    pageErrors.length = 0;
    const modeLogStart = consoleMessages.length;

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 10000 });
    await page.waitForFunction(
      (expectedMode) => document.body.textContent?.includes(`Current Mode: ${expectedMode}`),
      { timeout: 10000 },
      mode
    );

    const triggerTexts = {
      'raw-static': 'Open Raw Static Dialog',
      'raw-inputs': 'Open Raw Inputs Dialog',
      'convex-static': 'Open Convex Static Dialog',
      'convex-inputs': 'Open Convex Inputs Dialog',
      'current': 'New document',
      'home-page': 'New document',
      'cache-loop': null,
    };

    const triggerText = triggerTexts[mode];
    if (triggerText) {
      const trigger = await clickByExactText(page, triggerText);
      console.log('[repro] clicked trigger:', trigger);
    }
    await sleep(1200);

    const newLogs = takeNewConsoleMessages(modeLogStart);
    const sawTriggerLog = newLogs.some((message) => message.includes(`[dialog-debug:${mode}] trigger press`));
    const sawOpenLog = newLogs.some((message) => message.includes(`[dialog-debug:${mode}] onOpenChange true`));

    if (pageErrors.length > 0) {
      console.error(`[repro] mode failed: ${mode}`);
      console.error(pageErrors.join('\n---\n'));
      process.exitCode = 1;
      break;
    }

    if (!sawTriggerLog) {
      if (mode !== 'current' && mode !== 'home-page' && mode !== 'cache-loop') {
        throw new Error(`Trigger press log was not observed for mode: ${mode}`);
      }
    }

    if (!sawOpenLog) {
      if (mode !== 'current' && mode !== 'home-page' && mode !== 'cache-loop') {
        throw new Error(`Dialog open log was not observed for mode: ${mode}`);
      }
    }

    console.log(`[repro] mode passed without pageerror: ${mode}`);
  }
} finally {
  await browser.close();
}
