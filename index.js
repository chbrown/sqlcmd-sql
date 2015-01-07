/*jslint node: true */
var Connection = require('./connection');

var sqlcmd = module.exports = new Connection({});
sqlcmd.Connection = Connection;
