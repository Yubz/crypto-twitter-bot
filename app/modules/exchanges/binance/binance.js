const binance = require('node-binance-api');
const Storage = require('../../storage/storage');

module.exports = class Binance {

	constructor(opts) {
		this.storage = new Storage();
		this.percentageBalancePerTrade = 30/100;
		this.sellPercentage = 5/100;

		binance.options({
		  	APIKEY: opts.api_key,
		  	APISECRET: opts.api_secret,
		  	useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
		  	test: opts.debug // If you want to use sandbox mode where orders are simulated
		});
	}

	/**
	* Buy a coin
   	*
   	* @param   {String} coinSymbol   symbol for coin
   	* @param   {Number} btcSpend     maximum BTC you are willing to spend
   	* @param   {Number} adjustment   multiplier to apply to price to get ahead of the pump
   	* @returns {Object}              result of bittrex.tradebuy
   	*/
	async buyCoin(coinSymbol) {
		console.log(`Buying coin ${coinSymbol} on Binance!`);
		binance.prices((error, ticker) => {
			const coinMarket = coinSymbol+'BTC';
			if (ticker[coinMarket] != undefined) {
				console.log(`Coin ${coinSymbol} available on Binance!`);
				const coinPrice = ticker[coinMarket];
				console.log(`Price of ${coinSymbol}: `, coinPrice);
				const sellPrice = Number(coinPrice) + Number(coinPrice) * this.sellPercentage;
				const dateTime = new Date();
				const dateString = dateTime.getHours() + 'h' + dateTime.getMinutes();
				this.storage.writeFile(coinSymbol, dateString, coinPrice, sellPrice);
			} else {
				console.log(`Coin ${coinSymbol} not available on Binance!`);
			}
		});
	}

	buy() {
		binance.balance((error, balances) => {
		  	console.log(`BTC balance: ${balances.BTC.available}`);
			const quantity = (balances.BTC.available / coinPrice) * this.percentageBalancePerTrade;
			console.log(`${coinSymbol} tokens to buy: ${quantity}`);
			binance.marketBuy(coinMarket, quantity, (error, response) => {
			  	console.log("Market Buy response", response);
			  	console.log("Order id: " + response.orderId);
			  	// Now you can limit sell with a stop loss, etc.
			  	// When the stop is reached, a stop order becomes a market order
				// Note: You must also pass one of these type parameters:
				// STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT
				/*let type = "STOP_LOSS";
				let quantity = 1;
				let price = 0.069;
				let stopPrice = 0.068;
				binance.sell("ETHBTC", quantity, price, {stopPrice: stopPrice, type: type});*/
			});
		});
	}

	candleUpdates() {
		this.candlesticks = {};
		binance.prices((error, ticker) => {
			for (var key in ticker) {
				if (key.endsWith("BTC")) {
					this.candleUpdate(key);
				}
			}
		});
	}

	candleUpdate(coinMarket) {
		binance.websockets.chart(coinMarket, "1m", (symbol, interval, chart) => {
			let tick = binance.last(chart);
		  	const last = chart[tick];
		  	if (last != undefined && last.isFinal == undefined) {
		  		if (this.candlesticks[coinMarket] != undefined) {
		  			if (Number(this.candlesticks[coinMarket].volume) > 1000 && Number(last.volume) > Number(this.candlesticks[coinMarket].volume)*10) {
		  				console.log('VOLUME INCREASED !!', coinMarket);
		  				console.log(last.volume);
		  				console.log(this.candlesticks[coinMarket].volume);
		  			}
		  			if (this.candlesticks[coinMarket].volume < last.volume) {
			  			this.candlesticks[coinMarket] = last;
			  		}
		  		}
		  	}
		});
	}

}