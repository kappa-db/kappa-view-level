var Writable = require('readable-stream').Writable
var pump = require('pump')

module.exports = createIndex

function createIndex (ldb, opts) {
  return {
    maxBatch: 100 || opts.maxBatch,

    map: function (msgs, next) {//opts.map,
      var ops = []
      msgs.forEach(function (msg) {
        var res = opts.map(msg)
        if (res && Array.isArray(res)) {
          res = res.map(function (r) {
            return {
              type: 'put',
              key: r[0],
              value: r[1]
            }
          })
          ops.push.apply(ops, res)
        }
      })
      ldb.batch(ops, next)
    },

    api: opts.api,

    indexed: function (msgs) {
      if (opts.indexed) opts.indexed(msgs)
    },

    storeState: function (state, cb) {
      state = state.toString('base64')
      ldb.put('state', state, cb)
    },

    fetchState: function (cb) {
      ldb.get('state', function (err, state) {
        if (err && err.notFound) cb()
        else if (err) cb(err)
        else cb(null, Buffer.from(state, 'base64'))
      })
    },

    clearIndex: opts.clearIndex || function (cb) {
      var batch = []
      var maxSize = 5000
      pump(ldb.createKeyStream(), new Writable({
        objectMode: true,
        write: function (key, enc, next) {
          batch.push({ type: 'del', key })
          if (batch.length >= maxSize) {
            ldb.batch(batch, next)
          } else next()
        },
        final: function (next) {
          if (batch.length > 0) ldb.batch(batch, next)
          else next()
        }
      }), ondone)
      function ondone (err) {
        if (err) cb(err)
        else cb()
      }
    }
  }
}
