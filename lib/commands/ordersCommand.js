var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrexPromise = require('../bittrex-promise');

module.exports = ordersCommand;

function ordersCommand(argv){
    bittrexPromise.getOpenOrders().then(function(marketOrders){

        var orders = marketOrders.map((order)=>{
            var type = order.OrderType.replace('LIMIT_','');
            var total = (order.Limit * order.Quantity).toFixed(8);
            return {
                market: order.Exchange,
                type: type,
                price: order.Limit,
                amount: order.Quantity,
                total: total,
                orderNumber: order.OrderUuid
            };
        });
        
        var table  = new Table({head: ['Market'.cyan, 'Type'.cyan, 'Price'.cyan, 'Amount'.cyan, 'BTC Value'.cyan, 'Order UUID'.cyan]});

        orders.forEach((order)=>{
            var typeColored = order.type === 'SELL' ? order.type.yellow : order.type.magenta;
            table.push([order.market,typeColored, order.price,order.amount, order.total, order.orderNumber]);
        });

        console.log(table.toString());
    });
}