'use strict';

(function(){

var net = require('net');

function WebTelnetProxy(io, port, host) {
  if(this && (this instanceof WebTelnetProxy)) {
    this.reset();
    if(io) this.bind(io, port, host);
  } else {
    return new WebTelnetProxy(io, port, host);
  }
}

WebTelnetProxy.prototype = {
  reset: function() {
    this.io = null;
    this.logTraffic = false;

    this.isRunning = false;
    this.timer = 0;
    this.lastTick = 0;

    this.sockets = {};  // sid -> socket
    this.socketsCount = 0;
    
    this.port = 23;
    this.host = '127.0.0.1';
  },

  showTraffic: function(y) {
    this.logTraffic = y;
  },

  bind: function(io, port, host) {
    if(this.isRunning) throw new Error('WebTelnetProxy is already running.');

    var proxy = this;
    proxy.io = io;
    proxy.port = port;
    proxy.host = host;

    io.on('connection', function(sock){
      proxy.onConnected(sock);
    });

    proxy.lastTick = Date.now();
    proxy.isRunning = true;

    // init tick() timer
    proxy.tick();
    proxy.timer = setInterval(function(){
      proxy.tick();
    }, 1000);
    
    return this;
  },

  shutdown: function() {
    if(!this.isRunning) return;

    // clear tick() timer
    if(this.timer) clearInterval(this.timer);

    this.reset();

    return this;
  },

  tick: function() {
    var server = this;
    server.lastTick = Date.now();
  },

  onDisconnected: function(webSock) {
    var proxy = this;
    var peerSock = webSock.peerSock;
    if(peerSock) {
      webSock.peerSock = null;
      peerSock.peerSock = null;
      peerSock.end();
    }
    delete proxy.sockets[ webSock.id ];
    proxy.socketsCount --;
  },

  connectTelnet: function(webSock) {
    var proxy = this;

    var telnet = net.connect( proxy.port, proxy.host, function() {
      if(proxy.logTraffic) console.log('telnet connected');
      webSock.emit('status', 'Telnet connected.\n');
    });

    telnet.peerSock = webSock;
    webSock.peerSock = telnet;

    telnet.on('data', function(buf) {
      //console.log('telnet: ', buf.toString());
      var peerSock = telnet.peerSock;
      if(peerSock) {
        var arrBuf = new ArrayBuffer(buf.length);
        var view = new Uint8Array(arrBuf);
        for(var i=0; i<buf.length; ++i) {
          view[i] = buf[i];
        }
        peerSock.emit('stream', arrBuf);
      }
    });
    telnet.on('error', function(){
    });
    telnet.on('close', function(){
      if(proxy.logTraffic) console.log('telnet disconnected');
      webSock.emit('status', 'Telnet disconnected.\n');
    });
    telnet.on('end', function(){
      var peerSock = telnet.peerSock;
      if(peerSock) {
        peerSock.peerSock = null;
        telnet.peerSock = null;
      }
    });
  },

  onConnected: function(webSock) {
    var proxy = this;

    if(proxy.logTraffic) console.log('proxy client connected, socket id: ' + webSock.id);
    webSock.on('stream', function(message) {
      //console.log('websocket: ', message);
      var peerSock = webSock.peerSock;
      if(peerSock) {
        peerSock.write(message);
      } else {
        proxy.connectTelnet(webSock);
      }
    });

    webSock.on('disconnect', function(){
      if(proxy.logTraffic) console.log('proxy client disconnected, socket id: ' + webSock.id);
      proxy.onDisconnected(webSock);
    });

    proxy.sockets[webSock.id] = webSock;
    proxy.socketsCount ++;
  },
};

exports = module.exports = WebTelnetProxy;

})();
