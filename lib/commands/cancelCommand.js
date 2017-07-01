var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var bittrexPromise = require('../bittrex-promise');

module.exports = cancelCommand;

function cancelCommand(argv){
    bittrexPromise.cancel(argv.uuid).then(function(data){
        console.log('done');
    });
}