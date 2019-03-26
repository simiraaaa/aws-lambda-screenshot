
const launchChrome = require('@serverless-chrome/lambda');
const CDP = require('chrome-remote-interface');
const puppeteer = require('puppeteer');

/**
 * Lambdaハンドラ
 * @param {Object} event Lambdaイベントデータ
 * @param {Object} context Contextオブジェクト
 * @param {function} callback コールバックオプション
 */
exports.handler = async (event, context, callback) => {
  let slsChrome = null;
  let browser = null;
  let page = null;

  try {
    // 前処理
    // serverless-chromeを起動し、PuppeteerからWebSocketで接続する
    slsChrome = await launchChrome({
      flags: ['--window-size=1280,960', '--hide-scrollbars']
    });
    browser = await puppeteer.connect({
      browserWSEndpoint: (await CDP.Version()).webSocketDebuggerUrl
    });
    page = await browser.newPage();

    // ブラウザ操作
    await page.goto('https://qiita.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForNavigation({ timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitFor(1000);
    const base64 = await page.screenshot({ base64: true, type: 'jpeg' });

    return callback(null, `data:image/jpeg;base64,${base64}`);
  } catch (err) {
    console.error(err);
    return callback(null, JSON.stringify({ result: 'error' }));
  } finally {
    if (page) {
      await page.close();
    }

    if (browser) {
      await browser.disconnect();
    }

    if (slsChrome) {
      await slsChrome.kill();
    }
  }
};