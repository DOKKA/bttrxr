var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrexPromise = require('../bittrex-promise');

module.exports = buyCommand;

function getBalanceAndTicker(currencyPair,argv){

    var currArr = currencyPair.split('_');
    var baseCurrency = currArr[0].toUpperCase();
    var tradeCurrency = currArr[1].toUpperCase();
    var currencyPairFixed = baseCurrency + '-' + tradeCurrency;

    return Promise.all([bittrexPromise.getBalances(), bittrexPromise.getTicker(currencyPairFixed)]).then(function(data){

        var balances = data[0];
        var ticker = data[1];
        var balanceObj = _.find(balances, {Currency: baseCurrency});

        var availableBalance = balanceObj.Available;
        var tickerObj = ticker;
        var lowestAsk = parseFloat(tickerObj.Ask);

        return {
            argv: argv,
            baseCurrency: baseCurrency,
            tradeCurrency: tradeCurrency,
            balanceObj: balanceObj,
            tickerObj: tickerObj,
            availableBalance: availableBalance,
            lowestAsk: lowestAsk,
            currencyPairFixed: currencyPairFixed
        };

    });
}


function calculateBuy(obj){
    var argv = obj.argv;
    var availableBalance = obj.availableBalance;
    var lowestAsk = obj.lowestAsk;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var rate = argv.r ? argv.r : obj.lowestAsk;
    var amount = 0;
    var baseAmount = 0;
    
    if(argv.l){
        var limit = parseFloat(argv.l);
        rate = rate - (limit / 100.0) * rate;
    }

    if(argv.p){
        console.log(availableBalance)
        var baseBuyPercentage = parseFloat(argv.p);
        baseAmount = baseBuyPercentage/100.0 * availableBalance;
        amount = baseAmount/rate;
    } else if(argv.a){
        amount = parseFloat(argv.a);
        baseAmount = amount * rate;
    } else if(argv.t){
        baseAmount = parseFloat(argv.t);
        amount = baseAmount/rate;
    }

    obj.rate = parseFloat(rate.toFixed(8));
    obj.amount = parseFloat(amount.toFixed(8));
    obj.baseAmount = parseFloat(baseAmount.toFixed(8));

    return obj;
}

function placeBuy(obj){
    var argv = obj.argv;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var amount = obj.amount;
    var rate = obj.rate;
    var baseAmount = obj.baseAmount;
    var currencyPairFixed = obj.currencyPairFixed;

    console.log(`About to buy ${amount} ${tradeCurrency} at a rate of ${rate} (${baseAmount} btc)`);
    //if not a dry run
    if(!argv.d){
        return bittrexPromise.buyLimit(currencyPairFixed, amount, rate)
        .then(function(result){
            console.log(`Buy order ${result.uuid} placed.`);
            return obj;
        });
    } else {
        return obj;
    }
}


function buyCommand(argv){

    var currencyPair = argv.currencyPair.replace('-','_').toUpperCase();

    getBalanceAndTicker(currencyPair,argv)
        .then(calculateBuy)
        .then(placeBuy)
        .then(function(obj){
            console.log('done');
        });
}