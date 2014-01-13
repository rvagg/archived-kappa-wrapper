#!/usr/bin/env node


const fs      = require('fs')
    , url     = require('url')
    , Hapi    = require('hapi')
    , after   = require('after')
    , proxy   = require('kappa-bridge/proxy')
    , loadKey = proxy.loadKey
    , loadCa  = require('./load-ca')
    , config  = require('./config')()


function start () {

  var manifest = {
      servers : [
          {
              port     : config.kappaPort
            , protocol : 'http'
            , options  : { }
          }
      ]
    , plugins : {
          kappa : [ { }, {
            paths : [ config.privateRegistry, config.publicRegistry ]
          } ]
      }
  }

  if (config.tls && config.tls.key && config.tls.cert) {
    manifest.servers[0].protocol = 'https'
    manifest.servers[0].options.tls = config.tls
    manifest.servers[0].options.tls.requestCert = true
    manifest.servers[0].options.tls.rejectUnauthorized = true
  }

  if (typeof config.vhost == 'string')
    manifest.plugins.kappa[1].vhost = config.vhost

  if (typeof config.host == 'string')
    manifest.servers[0].host = config.host

  var composer = new Hapi.Composer(manifest)

  composer.compose(function (err) {
    if (err)
      throw err

    composer.start(function (err) {
      if (err)
        throw err

      console.log('Kappa listening on %s:%d', (config.host || ''), config.kappaPort)
    })
  })

  startRegistryProxy()
}

function startRegistryProxy () {
  if (typeof config.registryPort != 'number')
    return

  var registry = url.parse(config.privateRegistry)
    , options  = {
          local  : {
              host : config.host
            , port : config.registryPort
          }
        , remote : {
              host : registry.hostname
            , port : registry.port
          }
      }

  if (config.tls && config.tls.key && config.tls.cert)
    options.local.tls = config.tls

  proxy(options, function (err) {
    if (err)
      throw err

    console.log('Registry proxy listening on %s:%d', (config.host || ''), config.registryPort)
  })
}


var done = after(3, function (err) {
  if (err)
    throw err

  start()
})


loadKey(config, 'key', done)
loadKey(config, 'cert', done)
loadCa(config, done)