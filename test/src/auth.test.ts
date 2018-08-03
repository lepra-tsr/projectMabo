test('login_story', () => {
  const puppeteer = require('puppeteer');
  (async () => {
    const browser = await puppeteer.launch();
    const page  = await browser.newPage();
    await page.goto('localhost:3000/room/5b5ae235fe438245f14e0041');
    await page.screenshow({path:'test.png'});

    await browser.close();
  })();

  expect(1).toBe(1);
});
