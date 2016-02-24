#!/usr/bin/env node

'use strict';

var conf = {
  telnet: {
    host: '127.0.0.1',
    port: 23,
  },
  web: {
    host: '0.0.0.0',
    port: 8080,
  },
  www: __dirname + '/../www',
  logTraffic: true,
};

var argv = process.argv;
var me = argv[1];
var args = require('minimist')(argv.slice(2));

if(args._.length < 2) {
  process.stdout.write('Argument required.\nSyntax: webtelnet <http-port> <telnet-port> [<telnet-host>]\n\n');
  process.exit(1);
}

conf.web.port = parseInt(args._[0], 10);

conf.telnet.port = parseInt(args._[1], 10);
if(args._.length > 2) conf.telnet.host = args._[2];

var WebTelnetProxy = require('./webtelnet.js');

WebTelnetProxy.startProxy(conf);
