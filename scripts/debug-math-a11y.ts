import { chromium } from 'playwright';
import { createMarkdownMathSourceDocument } from '../app/components/ui/markdown/createMarkdownMathSourceDocument';

async function testConfig(configName: string, sreConfig: any) {
  console.log(`\n=== Testing ${configName} ===`);
  
  const markdown = String.raw`
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
`;

  // Temporarily modify the createMarkdownMathSourceDocument to use different SRE config
  const srcDoc = createMarkdownMathSourceDocument(markdown).replace(
    /sre:\s*\{[^}]*\}/,
    `sre: ${JSON.stringify(sreConfig)}`
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setContent(srcDoc, { waitUntil: 'load' });

    await page.waitForFunction(
      () => {
        const status = (window as any).__MATH_A11Y_STATUS__;
        return !!status && (status.typesetResolved === true || !!status.error);
      },
      { timeout: 15000 }
    );

    const result = await page.evaluate(() => {
      const w = window as any;
      const container = document.querySelector('mjx-container');
      const math = document.querySelector('mjx-math');
      const speech = document.querySelector('mjx-speech');

      return {
        mathSpeechNone: math?.getAttribute('data-semantic-speech-none') || null,
        speechAria: speech?.getAttribute('aria-label') || null,
        mathSpeech: math?.getAttribute('data-semantic-speech') || null,
        containerAria: container?.getAttribute('aria-label') || null,
      };
    });

    console.log(JSON.stringify(result, null, 2));
    
    // Check if we found natural speech
    const hasNaturalSpeech = 
      (result.mathSpeechNone && result.mathSpeechNone.includes('fraction with numerator')) ||
      (result.speechAria && result.speechAria.includes('fraction with numerator'));
    
    if (hasNaturalSpeech) {
      console.log('✅ FOUND NATURAL SPEECH!');
      return result;
    } else {
      console.log('❌ No natural speech found');
      return null;
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const configs: [string, any][] = [
    ['Current clearspeak default', { locale: 'en', domain: 'clearspeak', style: 'default' }],
    ['Clearspeak verbose', { locale: 'en', domain: 'clearspeak', style: 'verbose' }],
    ['Clearspeak brief', { locale: 'en', domain: 'clearspeak', style: 'brief' }],
    ['ChromeVox', { locale: 'en', domain: 'chromevox', style: 'default' }],
    ['MathSpeak', { locale: 'en', domain: 'mathspeak', style: 'default' }],
    ['MathSpeak verbose', { locale: 'en', domain: 'mathspeak', style: 'verbose' }],
    ['No domain (auto)', { locale: 'en' }],
  ];

  for (const [name, config] of configs) {
    const result = await testConfig(name, config);
    if (result) {
      console.log(`\n🎯 Natural speech found with config: ${name}`);
      process.exit(0);
    }
  }

  console.log('\n❌ No natural speech found with any SRE configuration');
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
