#!/usr/bin/env node

'use strict';

var conf = {
  telnet: {
    host: '127.0.0.1',
    port: 4000,
  },
  web: {
    host: '0.0.0.0',
    port: 8000,
  },
  www: __dirname + '/../www',
  logTraffic: true,
};

var args = require('minimist')(process.argv.slice(2));

if(args.p) conf.web.port = args.p;
if(args.h) conf.web.host = args.h;

if(args.mp) conf.telnet.port = args.mp;
if(args.mh) conf.telnet.host = args.mh;

var WebTelnetProxy = require('./webtelnet.js');

WebTelnetProxy.startProxy(conf);
