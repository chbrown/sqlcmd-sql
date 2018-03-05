[![Travis CI Build Status](https://travis-ci.org/chbrown/sqlcmd-sql.svg)](https://travis-ci.org/chbrown/sqlcmd-sql)

# sqlcmd-sql

[sqlcmd](https://github.com/chbrown/sqlcmd) for SQL strings.

    npm install --save sqlcmd-sql

Or in your `package.json`:

    { ...
      "dependencies": {
        "sqlcmd-sql": "*",
        ...
      }
    }

For example:

    var db = new require('sqlcmd-sql').Connection()
    db.Select('users').where('id = ?', 1).execute(function(err, rows) {
      // err == null
      // rows == ["SELECT users WHERE id = 1"]
    })


## License

Copyright 2015 Christopher Brown. [MIT Licensed](http://opensource.org/licenses/MIT).
