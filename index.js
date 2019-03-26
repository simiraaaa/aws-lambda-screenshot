// ref: https://qiita.com/glhfdev/items/bb8cd0d937c671100200
process.env.HOME = process.env.LAMBDA_TASK_ROOT;
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event, context, callback) => {
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
    page.setViewport({
      width: 1280,
      height: 960,
    });
    const url = event.query.url;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitFor(1000);

    const base64 = await page.screenshot({ encoding: 'base64', type: 'jpeg' });

    result = {
      url: url,
      base64: base64,
    };
  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
  return result;
  // callback(null, result);
};
