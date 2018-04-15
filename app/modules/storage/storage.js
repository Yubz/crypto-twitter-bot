var fs = require('fs');

module.exports = class Storage {

	constructor() {}

	writeFile(coinSymbol, dateTime, entryPrice, sellPrice) {
		const text = `${coinSymbol} -- ${dateTime} -- ${entryPrice} -- ${sellPrice}`;
		fs.writeFile("history.txt", text, function(err) {
		    if(err) {
		        return console.log(err);
		    }
	    	console.log("Order saved!");
		}); 
	}
}