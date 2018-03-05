import * as assert from 'assert'
import 'mocha'

import {PassThrough} from 'stream'
import {Connection} from '..'

describe('database create', () => {
  it('should interpolate values properly', done => {
    const memstream = new PassThrough()
    const db = new Connection({outputStream: memstream})
    db.executeSQL('INSERT INTO products (name, price) VALUES ($1, $2)', ['Pie', '5.49'], (err, res) => {
      memstream.end()
      const sql = memstream.read().toString()
      assert.equal(sql, "INSERT INTO products (name, price) VALUES ('Pie', '5.49');\n")
      done(err)
    })
  })
})
