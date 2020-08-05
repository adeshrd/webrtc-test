const puppeteer = require('puppeteer');

const args = process.argv;

const env = args[2];
let browsers = args[3] || 2;

let webUrl = 'http://localhost:9001/scale.html';
if (env && env === 'prod') {
	webUrl = 'https://webrtc-research.herokuapp.com/scale.html';
}



(async () => {
	const browser = await puppeteer.launch({
	    args: [ '--use-fake-ui-for-media-stream' ],
	    dumpio: true
	})

	const page = await browser.newPage();

	await page.evaluateOnNewDocument(function() {
	  navigator.geolocation.getCurrentPosition = function (cb) {
	    setTimeout(() => {
	      cb({
	        'coords': {
	          accuracy: 21,
	          altitude: null,
	          altitudeAccuracy: null,
	          heading: null,
	          latitude: 23.129163,
	          longitude: 113.264435,
	          speed: null
	        }
	      })
	    }, 1000)
	  }
	});

	await page.goto(webUrl);

	const btn = await page.$('#open-or-join');
	await btn.click();

	await page.waitFor(500000)

	await page.screenshot({path: 'example.png'});

	await browser.close();
})();
/*
const { Cluster } = require('puppeteer-cluster');
 
(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 20,
    puppeteerOptions: {
    	args: [ '--use-fake-ui-for-media-stream' ],
	    dumpio: true
    }
  });
 
  await cluster.task(async ({ page, data: url }) => {
	await page.evaluateOnNewDocument(function() {
	  navigator.geolocation.getCurrentPosition = function (cb) {
	    setTimeout(() => {
	      cb({
	        'coords': {
	          accuracy: 21,
	          altitude: null,
	          altitudeAccuracy: null,
	          heading: null,
	          latitude: 23.129163,
	          longitude: 113.264435,
	          speed: null
	        }
	      })
	    }, 1000)
	  }
	});

	await page.goto(url);

	const btn = await page.$('#open-or-join');
	await btn.click();

	await page.waitFor(500000)

	await page.screenshot({path: 'example.png'});
  });

  const url =  webUrl;

  while(browsers-- >0) {  	
	  cluster.queue(url);
  }
 
  await cluster.idle();
  await cluster.close();
})();

/**

KITE, testRTC, Jattack, WebdriverIO, Pion, webdriverrtc, cypher, pupeteer, pupeteer cluster

**/