var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrex = require('node.bittrex.api');

bittrex.options({
    apikey: '',
    apisecret: ''
});

var request = Promise.promisify(require("request"));



module.exports = balanceCommand;

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

function balanceCommand(argv){
    //getBalances().then(console.log)
    // getMarketSummaries().then(function(asdf){
    //     var zzz = asdf.map(function(foo){
    //         return foo.MarketName
    //     })
    //     console.log(zzz.join(' '))
    // })
    Promise.all([getBalances(), getMarketSummaries(), getBitcoinUSDPrice()]).then(function(data){
        var balances = data[0];
        var marketSummaries = data[1];
        var bitcoinPriceUSD = data[2];

        var coinBalances = balances.filter(function(balance){
            return balance.Balance > 0;
        });

        var balancesObj = {};
        coinBalances.forEach(function(balance){
            balancesObj[balance.Currency] = balance;
        });

        //console.log(balancesObj);

        var marketsObj = {};

        marketSummaries.filter(function(market){
            return /BTC\-\w+/.test(market.MarketName);
        }).map(function(market){
            var uuu = market.MarketName.split('-');
            var last = market.Last;
            var prev = market.PrevDay;
            var percentChange = (last - prev)/prev*100.0
            return {
                price: market.Last,
                percentChange: percentChange,
                baseCurrency: uuu[0],
                tradeCurrency: uuu[1]
            };
        }).forEach(function(market){
            marketsObj[market.tradeCurrency] = market;
        });

        //console.log(marketsObj);

        for(var key in balancesObj){
            var newObj = Object.assign(balancesObj[key], marketsObj[key]);
            if(newObj.Currency === 'BTC'){
                newObj.price = bitcoinPriceUSD;
                newObj.percentChange = 0;
                newObj.baseCurrency = 'USD';
                newObj.tradeCurrency = 'BTC';
            }
            balancesObj[key] = newObj;
        }



        var table  = new Table({head: ['Coin'.cyan, 'Rate'.cyan, '% Change'.cyan, 'BTC Value'.cyan, 'USD Value'.cyan]});

        var tableRows = [];
        for(var key in balancesObj){
            var market = balancesObj[key];

            var pc = market.percentChange;
            var pc2 = '';
            if(pc > 0){
                pc2 = pc.toFixed(2).green;
            } else {
                pc2 = pc.toFixed(2).red;
            }
            var btcValue = market.Balance * market.price

            tableRows.push([market.baseCurrency+'-'+market.tradeCurrency, market.price.toFixed(8), pc2, btcValue.toFixed(8), '$'+((btcValue * bitcoinPriceUSD).toFixed(2))]);
        }

        _.orderBy(tableRows,function(row){
            return row[3];
        },'desc').forEach(function(row){
            table.push(row);
        });
        
        //print the table
        console.log(table.toString());
    })

}