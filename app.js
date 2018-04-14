
const config = require('./config');
const CryptoTwitterBot = require('./app/modules/twitterBot/twitter-bot');

const cryptoTwitterBot = new CryptoTwitterBot(config);

;(async function() {
	let result = await cryptoTwitterBot.init();
})();