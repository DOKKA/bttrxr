var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrexPromise = require('../bittrex-promise');

module.exports = listCommand;

function listCommand(argv){
    var baseCurrency = argv.market.toUpperCase();

    bittrexPromise.getMarketSummaries().then(function(markets){
        //console.log(markets);
        var zzz = markets.map(function(market){
            var uuu = market.MarketName.split('-');
            var last = market.Last;
            var prev = market.PrevDay;
            var percentChange = (last - prev)/prev*100.0;
            
            return {
                price: last,
                percentChange: percentChange,
                baseVolume: market.BaseVolume,
                baseCurrency: uuu[0],
                tradeCurrency: uuu[1]
            };
        });

        var lists = _.groupBy(zzz, x=> x.baseCurrency);
        var list = lists[baseCurrency];

        var xxx = _.orderBy(list,function(market){
            if(argv.c){
                return market.tradeCurrency;
            } else if(argv.r){
                return market.price;
            } else if(argv.v){
                return market.baseVolume;
            } else if(argv.p){
                return market.percentChange;
            } else {
                return market.baseVolume;
            }
        },'desc');

        var table  = new Table({head: ['Coin'.cyan, 'Rate'.cyan,'Volume'.cyan, '% Change'.cyan]});

        var n = argv.n || xxx.length;

        for(var x = 0; x < n; x++){
            var market = xxx[x];
            var key = market.baseCurrency + '-' + market.tradeCurrency;
            var pc = market.percentChange || 0;
            var pc2 = '';
            if(pc > 0){
                pc2 = pc.toFixed(2).green;
            } else {
                pc2 = pc.toFixed(2).red;
            }
            table.push([key, market.price.toFixed(8), parseFloat(market.baseVolume.toFixed(3)), pc2]);
        }

        
        //print the table
        console.log(table.toString());
    });
}