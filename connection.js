/*jslint node: true */
var util = require('util');
var Connection = require('sqlcmd/connection');

function serializeSqlValue(raw) {
  if (raw === null) {
    return 'NULL';
  }
  else if (raw === undefined) {
    throw new Error('undefined has no SQL value');
  }
  else if (typeof raw == 'number') {
    return raw.toString();
  }
  else {
    // JSON.stringify doesn't quite work for all values because it uses double quotes
    // multiline strings are fine in SQL; all we care about is escaping the quotes
    var string = (typeof raw == 'string') ? raw : JSON.stringify(raw);
    return "'" + string.replace(/'/g, "''") + "'";
  }
}

/** Connection#executeCommand(command: sqlcmd.Command,
                              callback: (error: Error, rows: object[]))

Process a sqlcmd.Command simply by interpolating the parameters as valid SQL
values. This is unsafe, and doesn't even try to protect against SQL injection.

The rows returned in the callback are SQL strings, and there will generally be
only one row. The callback is called in the current event loop.
*/
Connection.prototype.executeCommand = function(command, callback) {
  var sql = command.toSQL();
  sql = sql.replace(/\$\w+/g, function(match) {
    var name = match.slice(1);
    var value = command.parameters[name];
    return serializeSqlValue(value);
  });
  callback(null, [sql]);
};

module.exports = Connection;
