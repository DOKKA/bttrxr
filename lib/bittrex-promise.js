var bittrex = require('node.bittrex.api');
var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

var apiKey = process.env.BITTREX_API_KEY;
var secret = process.env.BITTREX_API_SECRET;

bittrex.options({
    apikey: apiKey,
    apisecret: secret
});


module.exports = {
    getBitcoinUSDPrice: getBitcoinUSDPrice,
    getBalances: getBalances,
    getMarketSummaries: getMarketSummaries,
    getTicker: getTicker,
    sellLimit: sellLimit,
    buyLimit: buyLimit,
    getOpenOrders: getOpenOrders
};

function getBitcoinUSDPrice(){
    return request({url:'http://api.coindesk.com/v1/bpi/currentprice.json', json: true}).then(function(response){
        var body = response.body;
        return body.bpi.USD.rate_float
    });
}

function getBalances(){
    return new Promise(function(resolve, reject){
        bittrex.getbalances(function(response){
            if(response.error){
                reject(response.error);
            } else {
                resolve(response.result);
            }
        });
    });
}

function getMarketSummaries(){
    return new Promise(function(resolve, reject){
        bittrex.getmarketsummaries(function(data){
            if(data.error){
                reject(data.error);
            } else {
                resolve(data.result);
            }
        });
    });
}

function getTicker(currencyPair){
    return new Promise(function(resolve, reject){
        bittrex.getticker({market: currencyPair},function(response){
            if(response.error){
                reject(response.error);
            } else {
                resolve(response.result);
            }
        });
    });
}

function sellLimit(currencyPair, quantity, rate){
    return new Promise(function(resolve, reject){
        bittrex.selllimit({market: currencyPair, quantity: quantity, rate: rate},function(response){
            if(response.error || response.success === false){
                if(response.error){
                    reject(response.error);
                } else {
                    reject(response.message);
                }
            } else {
                resolve(response.result);
            }
        });
    });
}

function buyLimit(currencyPair, quantity, rate){
    return new Promise(function(resolve, reject){
        bittrex.buylimit({market: currencyPair, quantity: quantity, rate: rate},function(response){
            if(response.error || response.success === false){
                if(response.error){
                    reject(response.error);
                } else {
                    reject(response.message);
                }
            } else {
                resolve(response.result);
            }
        });
    });
}

function getOpenOrders(){
        return new Promise(function(resolve, reject){
        bittrex.getopenorders({},function(response){
            if(response.error || response.success === false){
                if(response.error){
                    reject(response.error);
                } else {
                    reject(response.message);
                }
            } else {
                resolve(response.result);
            }
        });
    });
}