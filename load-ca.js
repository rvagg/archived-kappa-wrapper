const fs   = require('fs')
    , path = require('path')
    , map  = require('map-async')


function loadCaFiles (config, dir, list, callback) {
  function read (file, callback) {
    file = path.join(dir, file)

    fs.readFile(file, 'utf8', callback)
  }

  function done (err, ca) {
    if (err)
      return callback(err)

    config.tls.ca = ca
    callback()
  }

  map(list, read, done)
}


function loadCa (config, callback) {
  if (!config.tls)
    return callback()

  if (Array.isArray(config.tls.ca))
    return loadCaFiles(config, config.configDir || '.', config.tls.ca, callback)

  var cadir = config.tls.cadir

  if (config.configDir)
    cadir = path.join(config.configDir, cadir)

  fs.readdir(config.tls.cadir, function (err, list) {
    if (err)
      return callback(err)

    list = list.filter(function (f) { return (/\.pem$/).test(f) })

    loadCaFiles(config, config.tls.cadir, list, callback)
  })
}


module.exports = loadCa