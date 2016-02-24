# WebTelnet

WebTelnet is a proxy server to bridge websocket to telnet.

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
# syntax: wtp <http-port> <telnet-port> [<telnet-host>]
# by default, telnet-host is 127.0.0.1

# example:
$ wtp 8080 23
```

## Credits

WebTelnet is created by Raymond Xie, published under MIT license.
