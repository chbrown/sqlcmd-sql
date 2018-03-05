import {Writable} from 'stream';
import {Command, Connection as BaseConnection, ConnectionOptions} from 'sqlcmd';

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

export interface StreamConnectionOptions extends ConnectionOptions {
  /** Output / target */
  outputStream: Writable;
}

export class Connection extends BaseConnection {
  options: StreamConnectionOptions;
  constructor(options: StreamConnectionOptions) {
    super(options);
  }

  executeSQL(sql: string,
             args: any[] | {[index: string]: any},
             callback: (error: Error, rows?: any[]) => void): void {
    let i = 0;
    const interpolated = sql.replace(/\?/g, match => {
      const value = args[i];
      i++;
      return serializeSqlValue(value);
    }).replace(/\$\d+/g, match => {
      const name = match.slice(1);
      const value = args[parseInt(name, 10) - 1];
      return serializeSqlValue(value);
    });
    this.options.outputStream.write(interpolated + ';\n', 'utf-8', (err) => {
      callback(err, [interpolated]);
    });
  }

  /**
  Process a sqlcmd.Command simply by interpolating the parameters as valid SQL
  values. This is unsafe, and doesn't even try to protect against SQL injection.

  The rows returned in the callback are SQL strings, and there will generally be
  only one row. The callback is called after writing to the outputStream ends.
  */
  executeCommand<R>(command: Command<R>,
                    callback: (error: Error, result?: R) => void): void {
    const sql = command.toSQL().replace(/\$\w+/g, match => {
      const name = match.slice(1);
      const value = command.parameters[name];
      return serializeSqlValue(value);
    });
    this.options.outputStream.write(sql + ';\n', 'utf-8', (err) => {
      const result: R = [sql] as any;
      callback(err, result);
    });
  }
}
