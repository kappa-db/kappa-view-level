# kappa-view-level

> make kappa-core views over leveldb

## Usage

```js
var kappa = require('kappa-core')
var View = require('kappa-view-level')
var ram = require('random-access-memory')
var memdb = require('memdb')

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
  feed.append({key: 'foo', value: 'bar'})
  feed.append({key: 'bax', value: 'baz'})

  core.ready('mapper', function () {
    core.api.mapper.get('foo', console.log)
    core.api.mapper.get('bax', console.log)
    core.api.mapper.get('nix', console.log)
  })
})
```

outputs

```
null 'bar'
null 'baz'
NotFoundError: Key not found in database [nix]
```

## API

```js
var View = require('kappa-view-level')
```

### var view = View(leveldb, opts)

Expects a LevelUP or LevelDOWN instance `leveldb`.

Required `opts` are:

- `map: function (msg)`: a mapper function that returns an array of `[key,
  value]` arrays.
- `api: {}`: an object that defines API functions that the view exposes. These
  can have whatever names you want, be sync or async, and return whatever you'd
  like.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install kappa-view-level
```

## Acknowledgments

kappa-view-level was inspired by
[flumeview-level](https://github.com/flumedb/flumeview-level).

## License

ISC
