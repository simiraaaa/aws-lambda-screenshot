
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event, context) => {
  let result = null;
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    let page = await browser.newPage();

    await page.goto('https://qiita.com/', { waitUntil: 'domcontentloaded' });
    await page.waitFor(1000);

    const base64 = await page.screenshot({ encoding: 'base64', type: 'jpeg' });

    result = `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return context.succeed(result);
};
