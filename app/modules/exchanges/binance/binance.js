const binance = require('node-binance-api');

module.exports = class Binance {

	constructor(opts) {
		this.percentageBalancePerTrade = 30/100;

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
			} else {
				console.log(`Coin ${coinSymbol} not available on Binance!`);
			}
		});
		/*const market   = `BTC-${coinSymbol}`;
	    const res0     = await this.bittrex.gettickerAsync({ market });
	    const ticker   = res0.result;
	    const rate     = ticker.Ask + (ticker.Ask * adjustment);
	    const quantity = btcSpend / rate;
	    const opts = {
	      MarketName:    market,
	      OrderType:     'LIMIT',
	      Quantity:      quantity,
	      Rate:          rate,
	      TimeInEffect:  'IMMEDIATE_OR_CANCEL',
	      ConditionType: 'NONE',
	      Target:        0
	    };
	    return opts;*/
	}

	async getAllCoinsAvailable() {
		binance.prices((error, ticker) => {
			console.log(ticker);
		});
	}
}