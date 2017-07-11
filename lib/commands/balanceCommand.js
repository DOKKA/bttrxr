var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');
var bittrexPromise = require('../bittrex-promise');


module.exports = balanceCommand;


function balanceCommand(argv){
    Promise.all([bittrexPromise.getBalances(), bittrexPromise.getMarketSummaries()]).then(function(data){

        var balances = data[0];
        var marketSummaries = data[1];

        var USDTMarket = _.find(marketSummaries, {MarketName: 'USDT-BTC'});
        var bitcoinPriceUSD = USDTMarket.Last;

        var coinBalances = balances.filter(function(balance){
            return balance.Balance > 0;
        });

        var balancesObj = {};
        coinBalances.forEach(function(balance){
            balancesObj[balance.Currency] = balance;
        });

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

        for(var key in balancesObj){
            var newObj = Object.assign(balancesObj[key], marketsObj[key]);

            if(newObj.Currency === 'BTC'){
                newObj.price = bitcoinPriceUSD;
                newObj.percentChange = 0;
                newObj.baseCurrency = 'USD';
                newObj.tradeCurrency = 'BTC';
            } else if(newObj.Currency === 'USDT'){
                newObj.price = 1;
                newObj.percentChange = 0;
                newObj.baseCurrency = 'USD';
                newObj.tradeCurrency = 'USDT';
            }
            balancesObj[key] = newObj;
        }



        var table  = new Table({head: ['Coin'.cyan, 'Rate'.cyan, '% Change'.cyan, 'BTC Value'.cyan, 'USD Value'.cyan]});

        var tableRows = [];
        for(var key in balancesObj){
            var market = balancesObj[key];

            var pc = market.percentChange || 0;
            var pc2 = '';

            if(pc > 0){
                pc2 = pc.toFixed(2).green;
            } else {
                pc2 = pc.toFixed(2).red;
            }
            var btcValue = 0;
            var usdValue = 0;
            if(market.tradeCurrency === 'BTC'){
                btcValue = market.Balance;
                usdValue = btcValue * bitcoinPriceUSD;
            } else if(market.tradeCurrency === 'USDT'){
                btcValue = 0;
                usdValue = market.Balance;
            } else {
                btcValue = market.Balance * market.price
                usdValue = btcValue * bitcoinPriceUSD;
            }
            
            tableRows.push([market.baseCurrency+'-'+market.tradeCurrency, market.price.toFixed(8), pc2, btcValue.toFixed(8), '$'+((usdValue).toFixed(2))]);
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