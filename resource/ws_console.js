~function (global) {
  var EnvDetect = {
    getBrowser: function () {
      var data = [
        {
          reg: /AliApp\((TB|TM|JU|AP|[A-Z]+)\/([^\)]+)\)/i,
          name: "AliApp"
        }, {
          reg: /UCBrowser\/([\d\.]+)/i,
          name: "UC"
        }, {
          reg: /MicroMessenger\/([\d\.]+)/i,
          name: "WeiXin"
        }, {
          reg: /__weibo__([\d\.]+)/i,
          name: "WeiBo"
        }, {
          reg: /(CriOS|Chrome)\/([\d\.])+/i,
          name: "Chrome"
        }, {
          reg: /Safari\/([\d\.]+)/i,
          name: "Safari"
        }, {
          reg: /MQQBrowser\/([\d\.]+)/i,
          name: "QQBrowser"
        }
      ]
      var UA   = navigator.userAgent
      var browser

      for (var i = 0; i < data.length; i++) {
        browser = UA.match(data[i].reg)
        if (!!browser) {
          return {
            name: data[i].name,
            version: browser[1]
          }
        }
      }
      return {
        name: "Unknown",
        version: "Unknown"
      }
    },
    getOS: function () {
      var data = [
        {
          reg: /(iPhone|iPad|iPod)/,
          name: "iOS"
        }, {
          reg: /Android[\s\/]([\d\.]+)/,
          name: "Android"
        }, {
          reg: /Windows\sPhone\s(?:OS\s)?([\d\.]+)/i,
          name: "WinPhone"
        }, {
          str: navigator.platform,
          reg: /Win/,
          name: "Win"
        }, {
          str: navigator.platform,
          reg: /Mac/,
          name: "Mac"
        }, {
          str: navigator.platform,
          reg: /Linux/,
          name: "Linux"
        }]
      var UA   = navigator.userAgent
      var UP   = navigator.platform
      var OS

      for (var i = 0; i < data.length; i++) {
        OS = UA.match(data[i].reg)
        if (!!OS) {
          return {
            name: data[i].name,
            version: OS[1]
          }
        }
      }

      for (var i = 0; i < data.length; i++) {
        OS = UP.match(data[i].reg)
        if (!!OS) {
          return {
            name: data[i].name,
            version: OS[1]
          }
        }
      }
      return {
        name: "Unknown",
        version: "Unknown"
      }
    },
    detect: function () {
      return {
        browser: this.getBrowser(),
        os: this.getOS()
      }
    }
  }

  return global.env = EnvDetect.detect()
}(window.wsConsole = window.wsConsole || {});
(function(window) {
    function Ws(callback, host, port) {
        port = port || 8003;
        var ws = new WebSocket('ws:' + host + ':' + port);
        ws.onopen = function() {
            console.log('connected.');
        };
        ws.onclose = function() {
            console.log('closed');
        };
        ws.onerror = function(error) {
            console.log(error);
            // ws = new WebSocket('ws://127.0.0.1:' + port);
        };
        ws.onmessage = function(event) {
            typeof callback === 'function' && callback(event);
        };
        this.ws = ws;
    }
    Ws.prototype.send = function(obj, errorHandler) {
        this.ws.send(JSON.stringify(obj), function(err) {
            errorHandler(err);
        })
    }
    function onMessage(event) {
        var json = JSON.parse(event.data);
        if(json.flag === 'ws_console_server' && json.type==='exec') {
            console.log(eval(json.data));
        }
    }
    var myScript = document.scripts[0] || document.getElementsByTagName('script')[0];
    var host = myScript.getAttribute('src').split(':').shift();
    var port = myScript.getAttribute('wsport');
    var ws = new Ws(onMessage, '127.0.0.1', port);
    var fn = {
        watch: function(func, before, after) {
            return function() {
                var args = [].slice.call(arguments);
                before && before.apply(this, args);
                var ret = func.apply(this, arguments);
                after && after.apply(this, arguments);
                return ret;
            }
        }
    };

    var noop = function() {};
    var env = window.wsConsole.env.os.name + ' '+ window.wsConsole.env.browser.name;
    var emitConsole = function(type) {
        return function() {
            ws.send({flag: 'ws_console', type: type, env: env, data: [].slice.call(arguments)});
        }
    };
    var ws_console = {};
    var console = window && window.console;
    for(var i in console) {
        if(console.hasOwnProperty(i)) {
            ws_console[i] = fn.watch(console[i], noop, emitConsole(i))
        }
    }
    window.oldConsole = console;
    window.console = console = ws_console;
    window.onerror = function(e) {
        console.error(e);
    }
})(window);
