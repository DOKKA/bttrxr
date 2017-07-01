var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrexPromise = require('../bittrex-promise');

module.exports = ordersCommand;

function ordersCommand(argv){
    bittrexPromise.getOpenOrders().then(function(data){
        console.log(data);
    })
}