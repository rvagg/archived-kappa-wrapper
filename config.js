const argv   = require('optimist').argv
    , xtend  = require('xtend')
    , path   = require('path')

var defaultOptions = {
    kappaPort       : 8080
  , privateRegistry : 'http://localhost:5984/registry/_design/ghost/_rewrite/'
  , publicRegistry  : 'https://registry.npmjs.org/'
}


function getConfig () {
  var config

  if (argv.c) {
    config = xtend(defaultOptions, require(path.resolve(argv.c)))
    config.configDir = path.dirname(argv.c)
  } else {
    config = defaultOptions

    if (argv.h)
      config.host = argv.h
    if (argv.kp)
      config.kappaPort = +argv.kp
    if (argv.rp)
      config.kappaPort = +argv.rp

    if (argv.key)
      (config.tls || (config.tls = {})).keyFile = argv.key
    if (argv.cert)
      (config.tls || (config.tls = {})).certFile = argv.cert

    if (argv.public)
      config.publicRegistry = argv.public
    if (argv.private)
      config.privateRegistry = argv.private

    if (argv.ca)
      config.ca = Array.isArray(argv.ca) ? argv.ca : [ argv.cs ]

    if (argv.cadir)
      config.cadir = argv.cadir
  }

  if (!config
      || typeof config.kappaPort != 'number'
      || typeof config.publicRegistry != 'string'
      || typeof config.privateRegistry != 'string'
    ) {

    console.error('Usage: kappa-wrapper -c <config file json/js>')
    console.error('   or: kappa-wrapper [-h <hostname>] [-kp <kappa port>] [-rp <registry port>] '
                + '-s <private registry url> [-v <vhost name>] '
                + '[-key <key file> -cert <cert file> -ca <cert>[ -ca <cert [...]]')
    process.exit(-1)
  }

  return config
}

module.exports = getConfig