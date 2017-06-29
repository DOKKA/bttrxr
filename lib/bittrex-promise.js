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
    getTicker: getTicker
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

function getTicker(){
    return new Promise(function(resolve, reject){
        bittrex.getticker(function(response){
            if(response.error){
                reject(response.error);
            } else {
                resolve(response.result);
            }
        });
    });
}