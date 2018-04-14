var Twit = require('twit');
var Binance = require('../exchanges/binance/binance');

module.exports = class CryptoTwitterBot {

	constructor(opts) {
		this.debug = opts.debug || false;
		this.btcSpend = opts.btcSpend || 0.001;

		this.Twitter = new Twit({
		  consumer_key: opts.secret.twitter.consumer_key,
		  consumer_secret: opts.secret.twitter.consumer_secret,
		  access_token: opts.secret.twitter.access_token,
		  access_token_secret: opts.secret.twitter.access_token_secret
		});

		this.cryptoRandId = '859484337850523648';
		this.devId = '956512080257011714';

		// Exchanges
		this.binance = new Binance(opts.secret.binance);
	}

	async init() {
		this.stream = this.Twitter.stream('statuses/filter', {follow: this.debug ? this.devId : this.cryptoRandId});
		this.stream.on('tweet', this.handleTweet.bind(this));
		this.stream.on('connect', () => { console.warn('Connected to Twitter stream') });
		this.stream.on('error', (err) => { console.warn('Error: ', err) });
	}

	async handleTweet(tweet) {
		console.log('Tweet received !', tweet.text);
      	const coins = await this.identifyCoin(tweet.text);
      	if (coins.length === 1) {
	        this.binance.buyCoin(coins[0], this.btcSpend);
      	} else if (coins.length > 1) {
      		console.warn('MORE THAN ONE COIN FOUND IN TWEET !', tweet.text);
      	} else {
        	console.warn('NO COINS FOUND IN TWEET !', tweet.text);
      	}
	}

	async identifyCoin(tweetText) {
		var re = /(?:^|\W)\$(\w+)(?!\w)/g, match, coins = [];
		while (match = re.exec(tweetText)) {
		  coins.push(match[1]);
		}
		return coins;
	}

};