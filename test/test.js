var kappa = require('kappa-core')
var View = require('..')
var ram = require('random-access-memory')
var memdb = require('memdb')
var test = require('tape')

test('mapper', function (t) {
  t.plan(7)

  var core = kappa(ram, { valueEncoding: 'json' })
  var lvl = memdb()

  var view = View(lvl, {
    map: function (msg) {
      return [
        [ msg.value.key, msg.value.value ]  // map first element to second element
      ]
    },
    
    api: {
      get: function (core, key, cb) {
        lvl.get(key, cb)
      }
    }
  })

  core.use('mapper', view)

  core.writer(function (err, feed) {
    t.error(err)

    feed.append({key: 'foo', value: 'bar'})
    feed.append({key: 'bax', value: 'baz'})

    core.ready('mapper', function () {
      core.api.mapper.get('foo', function (err, res) {
        t.error(err)
        t.same(res, 'bar')
      })
      core.api.mapper.get('bax', function (err, res) {
        t.error(err)
        t.same(res, 'baz')
      })
      core.api.mapper.get('nix', function (err, res) {
        t.ok(err)
        t.ok(err.notFound)
      })
    })
  })
})
