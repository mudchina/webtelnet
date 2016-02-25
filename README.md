# WebTelnet

WebTelnet is a proxy server to bridge websocket to telnet, enable visiting telnet servers with browsers.

## Purpose

WebTelnet can be used to:

* Visit telnet servers with browser.
* Play MUD game with browser.

## Install

```bash
$ [sudo] npm install -g webtelnet
```

## Usage

```bash
# by default, telnet-host is 127.0.0.1
$ webtelnet <http-port> <telnet-port> [<telnet-host>]
```

Example:

Assuming you have a MUD server running at port 4000, to map it to http port 8080:

```bash
$ webtelnet 8080 4000
```

Then, use a browser to visit the web: http://your-host:8080/

## Screenshot

Playing MUD with PC broswer:

![webmud-pc](https://github.com/mudchina/webtelnet/raw/master/docs/webmud-pc.jpg)

Playing MUD with mobile broswer on iPhone6:

![webmud-mobile](https://github.com/mudchina/webtelnet/raw/master/docs/webmud-ios.jpg)

## Credits

Created by Raymond Xie, published under MIT license.
