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
# by default, telnet-host is 127.0.0.1
$ webtelnet <http-port> <telnet-port> [<telnet-host>]
```

Example (map telnet port 23 to web port 8080):

```bash
$ webtelnet 8080 23
```

## Credits

Created by Raymond Xie, published under MIT license.
