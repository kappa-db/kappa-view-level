var View = require('kappa-view')

module.exports = createIndex

function createIndex (ldb, opts) {
  return View(ldb, opts, function (db) {
    return {
      map: function (msgs, next) {
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
      }
    }
  })
}
