module.exports = {
  'dbUrl': 'mongodb://rezel.monkieblankie.com:3101/telemetry',
  'dbOptions': {
    'user': 'myapp',
    'pass': 'admin2016',
    'auth': {
      'authdb': 'admin'
    },
    "server": {   
      "auto_reconnect": true,
      "poolSize": 200,
      "socketOptions": {
         "keepAlive": 1
      }
    }
  },
  'secret': 'admin2016',
  'maxRecords': 9999,
  'vehicles': ["Kubos01", "Kubos02", "IBEX", "CST-100 Starliner", "Orion MPCV", "Dream Chaser CRS-2", "ISRO OV",
    "Skylon D1", "XCOR Lynx", "SIRIUS-1", "ISS (ZARYA)"],
  'exchange':'telemetryExchange',
  'exchangeType': 'topic',
  'serverURL': 'rezel.monkieblankie.com',
  'serverEndpoint': 'amqp://myapp:admin2016@rezel.monkieblankie.com',
  'mqConfig': {
    'user': 'myapp',
    'pass': 'admin2016',
    'server': 'rezel.monkieblankie.com'
  },
  // when starting NodeJS server, we can disable/enable modules
  'serverStartupOptions': {
    'apiHttp': true,
    'apiHttps': true,
    'socketHttp': true,
    'socketHttps': true
  }
};
