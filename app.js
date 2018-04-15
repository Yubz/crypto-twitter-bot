
const config = require('./config');
const CryptoTwitterBot = require('./app/modules/twitterBot/twitter-bot');
const Binance = require('./app/modules/exchanges/binance/binance');

const cryptoTwitterBot = new CryptoTwitterBot(config);
const binance = new Binance(config.secret.binance);

;(async function() {
	//let result = await cryptoTwitterBot.init();
	binance.candleUpdates();
})();