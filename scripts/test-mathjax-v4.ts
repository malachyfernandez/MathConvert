import { chromium } from 'playwright';
import { createMarkdownMathSourceDocument } from '../app/components/ui/markdown/createMarkdownMathSourceDocument';

async function main() {
  const markdown = String.raw`
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
`;

  const srcDoc = createMarkdownMathSourceDocument(markdown);

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
        mathJaxVersion: w.MathJax?.version || null,
        containerAria: container?.getAttribute('aria-label') || null,
        containerSpeechNone:
          container?.getAttribute('data-semantic-speech-none') || null,
        mathSpeechNone:
          math?.getAttribute('data-semantic-speech-none') || null,
        mathSpeech: math?.getAttribute('data-semantic-speech') || null,
        speechAria: speech?.getAttribute('aria-label') || null,
        firstContainerOuterHTML: container?.outerHTML?.slice(0, 2000) || null,
      };
    });

    console.log(JSON.stringify(result, null, 2));

    // Check for success criterion
    const targetString = "x equals the fraction with numerator negative b plus or minus the square root of b squared minus 4 a c and denominator 2 a";
    const hasTargetSpeech = 
      result.containerAria === targetString ||
      result.mathSpeechNone === targetString ||
      result.speechAria === targetString;

    if (hasTargetSpeech) {
      console.log('\n🎯 SUCCESS: Target natural speech found!');
      process.exit(0);
    } else {
      console.log('\n❌ Target natural speech not found');
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
