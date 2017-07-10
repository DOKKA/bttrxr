var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrexPromise = require('../bittrex-promise');

module.exports = sellCommand;

function getBalanceAndTicker(currencyPair,argv){

    var currArr = currencyPair.split('_');
    var baseCurrency = currArr[0].toUpperCase();
    var tradeCurrency = currArr[1].toUpperCase();
    var currencyPairFixed = baseCurrency + '-' + tradeCurrency;
    return Promise.all([bittrexPromise.getBalances(), bittrexPromise.getTicker(currencyPairFixed)]).then(function(data){

        var balances = data[0];
        var ticker = data[1];

        var balanceObj = _.find(balances, {Currency: tradeCurrency});

        var availableBalance = balanceObj.Available;
        var tickerObj = ticker;
        var highestBid = tickerObj.Bid;


        return {
            argv: argv,
            baseCurrency: baseCurrency,
            tradeCurrency: tradeCurrency,
            balanceObj: balanceObj,
            tickerObj: tickerObj,
            availableBalance: availableBalance,
            highestBid: highestBid,
            currencyPairFixed: currencyPairFixed
        };

    });
}


function calculateSell(obj){
    var argv = obj.argv;
    var availableBalance = obj.availableBalance;
    var highestBid = obj.highestBid;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var rate = argv.r ? argv.r : obj.highestBid;
    var amount = 0;
    var baseAmount = 0;
    
    if(argv.l){
        var limit = parseFloat(argv.l);
        rate = (limit / 100.0) * rate + rate;
    }

    if(argv.panic){
        //panic sell should cancel open orders too
        rate = rate - 0.00000003;
        console.log('LEARN TO HODL'.magenta);
    }

    if(argv.p){
        var tradeSellPercentage = parseFloat(argv.p);
        amount = tradeSellPercentage/100.0 * availableBalance;
        baseAmount = amount * rate;
    } else if(argv.a){
        amount = parseFloat(argv.a);
        baseAmount = amount * rate;
    } else if(argv.t){
        baseAmount = parseFloat(argv.t);
        amount = baseAmount/rate;
    }

    //bittrex charges a 0.25% fee per transaction
    amount = amount - (amount *.0025);
    baseAmount = baseAmount - (baseAmount * .0025);

    obj.rate = parseFloat(rate.toFixed(8));
    obj.amount = parseFloat(amount.toFixed(8));
    obj.baseAmount = parseFloat(baseAmount.toFixed(8));

    return obj;
}


function placeSell(obj){
    var argv = obj.argv;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var amount = obj.amount;
    var baseAmount = obj.baseAmount;
    var rate = obj.rate;
    var currencyPairFixed = obj.currencyPairFixed;

    console.log(`About to sell ${amount} ${tradeCurrency} at a rate of ${rate} (${baseAmount} btc)`);
    //if not a dry run
    if(!argv.d){
        return bittrexPromise.sellLimit(currencyPairFixed, amount, rate)
        .then(function(result){
            console.log(`Sell order ${result.uuid} placed.`);
            return obj;
        });
    } else {
        return obj;
    }
}



function sellCommand(argv){
//match currencyPair and give an error for not a valid currencyPair
    var currencyPair = argv.currencyPair.replace('-','_').toUpperCase();

    getBalanceAndTicker(currencyPair,argv)
        .then(calculateSell)
        .then(placeSell)
        .then(function(obj){
            console.log('done');
        });
}