var kappa = require('kappa-core')
var View = require('.')
var ram = require('random-access-memory')
var memdb = require('memdb')

var core = kappa(ram, { valueEncoding: 'json' })
var lvl = memdb()

var view = View(lvl, {
  map: function (msg) {
    return [
      [ msg.value.key, msg.value.value ]
    ]
  },
  
  api: {
    get: function (key, cb) {
      lvl.get(key, cb)
    }
  }
})

core.use('mapper', view)

core.feed(function (err, feed) {
  feed.append({key: 'foo', value: 'bar'})
  feed.append({key: 'bax', value: 'baz'})

  core.ready('mapper', function () {
    core.api.mapper.get('foo', console.log)
    core.api.mapper.get('bax', console.log)
    core.api.mapper.get('nix', console.log)
  })
})
