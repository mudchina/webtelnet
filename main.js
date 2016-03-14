#!/usr/bin/env node

'use strict';

var info = require('./package.json');

var path = require('path'),
    socketio = require('socket.io'),
    express = require('express'),
    http = require('http'),
    webtelnet = require('./webtelnet-proxy.js');

var conf = {
  telnet: {
    host: '127.0.0.1',
    port: 23,
  },
  web: {
    host: '0.0.0.0',
    port: 8080,
  },
  www: path.resolve(__dirname + '/www'),
  logTraffic: true,
};

var argv = process.argv;
var me = argv[1];
var args = require('minimist')(argv.slice(2));

process.stdout.write('webtelnet, version ' + info.version + ', by ' + info.author.name + ' <' + info.author.email +'>\n');

if(args._.length < 2) {
  process.stdout.write(
    'Syntax: webtelnet <http-port> <telnet-port> [options]\n' +
    'Options: \n' +
    '    [-h <telnet-host>]\n' +
    '    [-w <path/to/www>]\n' +
    '    [-c <charset>]\n'
  );
  process.exit(0);
}

conf.web.port = parseInt(args._[0], 10);
conf.telnet.port = parseInt(args._[1], 10);

if(args.h) conf.telnet.host = args.h;
if(args.w) conf.www = path.resolve(args.w);

var app = express().use(express.static(conf.www));
var httpserver = http.createServer(app);
httpserver.listen(conf.web.port, conf.web.host, function(){
  console.log('listening on ' + conf.web.host + ':' + conf.web.port);
});

// create socket io
var io = socketio.listen(httpserver);

// create webtelnet proxy and bind to io
var webtelnetd = webtelnet(io, conf.telnet.port, conf.telnet.host);
if(args.c) webtelnetd.setCharset(args.c);