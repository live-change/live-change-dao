const SockJS = require("sockjs-client")
const rd = require("@live-change/dao")
const Connection = rd.ReactiveConnection
const debug = require('debug')('dao:sockjs')

class SockJsConnection extends Connection {
  constructor(credentials, url, settings) {
    super(credentials, settings)
    this.url = url
    this.initialize()
  }

  initialize() {
    this.connection = new SockJS(this.url)
    const connection = this.connection
    console.log("INITIALIZE SOCKJS!", this.url)
    connection.onopen = (function () {
      if (connection.readyState === SockJS.CONNECTING) return setTimeout(connection.onopen, 230)
      this.handleConnect()
    }).bind(this)
    connection.onclose = (function () {
      const ef = function () {
      }
      connection.onclose = ef
      connection.onmessage = ef
      connection.onheartbeat = ef
      connection.onopen = ef
      this.handleDisconnect()
    }).bind(this)
    this.connection.onmessage = (function (e) {
      debug("MSG IN:", e.data)
      const message = JSON.parse(e.data)
      this.handleMessage(message)
    }).bind(this)
    /*this.connection.onheartbeat = (function(){
     console.log('BULLET PING!')
     this.send({type:"ping"})
     }).bind(this)*/
  }

  send(message) {
    const data = JSON.stringify(message)
    debug("MSG OUT:", data)
    this.connection.send(data)
  }

  reconnect() {
    this.connection.close()
    if (this.autoReconnect) return;
    this.initialize()
  }

  dispose() {
    super.dispose()
    this.connection.close()
  }

  closeConnection() {
    this.connection.close()
  }

}

module.exports = SockJsConnection
module.exports.SockJsConnection = SockJsConnection
