const puppeteer = require('puppeteer');

const args = process.argv;

const env = args[2];
let throttleConfig = args[3];

let webUrl = 'http://localhost:9001/scale.html';
if (env && env === 'prod') {
	webUrl = 'https://webrtc-research.herokuapp.com/scale.html';
}




(async () => {

	let closeConfig = {
		throttleConfig: {
			// Whether chrome should simulate
			// the absence of connectivity
			'offline': false,
			// Simulated download speed (bytes/s)
			'downloadThroughput': 180000,
			// Simulated upload speed (bytes/s)
			'uploadThroughput': 180000,
			// Simulated latency (ms)
			'latency': 5
		},

		location: {
			latitude: 53.350140,
			longitude: -6.26615
		}
	};

	let farConfig = {
		throttleConfig: {
			// Whether chrome should simulate
			// the absence of connectivity
			'offline': false,
			// Simulated download speed (bytes/s)
			'downloadThroughput': 150000,
			// Simulated upload speed (bytes/s)
			'uploadThroughput': 150000,
			// Simulated latency (ms)
			'latency': 20
		},

		location: {
			latitude: 51.509865,
			longitude: -0.118092
		}
	};

	let farthestConfig = {
		throttleConfig: {
			// Whether chrome should simulate
			// the absence of connectivity
			'offline': false,
			// Simulated download speed (bytes/s)
			'downloadThroughput': 100000,
			// Simulated upload speed (bytes/s)
			'uploadThroughput': 100000,
			// Simulated latency (ms)
			'latency': 80
		},

		location: {
			latitude: 31.000000,
			longitude: -100.000000
		}
	};

	const configs = [closeConfig, farConfig, farthestConfig];



	const browser = await puppeteer.launch({
	    args: [ '--use-fake-ui-for-media-stream' ],
	    dumpio: true,
		headless: true
	})

	const page = await browser.newPage();
	const config = configs[throttleConfig];

	await page.evaluateOnNewDocument(function(config) {
	  navigator.geolocation.getCurrentPosition = function (cb) {
	    setTimeout(() => {
	      cb({
	        'coords': {
	          accuracy: 21,
	          altitude: null,
	          altitudeAccuracy: null,
	          heading: null,
	          latitude: config.location.latitude,
	          longitude: config.location.longitude,
	          speed: null
	        }
	      })
	    }, 1000)
	  }
	}, config);

	// Connect to Chrome DevTools
	const client = await page.target().createCDPSession();

	// Set throttling property
	await client.send('Network.emulateNetworkConditions', config.throttleConfig);

	await page.goto(webUrl);

	const btn = await page.$('#open-or-join');
	await btn.click();

	await page.waitFor(300000);

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