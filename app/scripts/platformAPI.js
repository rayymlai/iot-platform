// Program: platformAPI.js 
// Purpose: Platform API to write heart-beat and telemetry data into MongoDB
// Author:  Ray Lai
// Updated: Sep 12, 2016
// License: MIT license
//
module.exports = function(app, bodyParser, mongoose, fs, syslogger, logger, helper) {
  var LineReader = require('line-by-line');
  var FileStreamRotator = require('file-stream-rotator');
  var randomstring = require('randomstring');
  var async = require('async');

  var systemSettings = require('../../config/systemSettings.js');
  var nTimesMax = systemSettings.maxRecords;

  mongoose.connect(systemSettings.dbUrl, systemSettings.dbOptions); 
  var db = mongoose.connection;

  var Telemetry  = require('../models/telemetry.js');

  // common database handlers
  db.on('connected', function (err) {
    console.log('MongoDB connected - platformAPI.js (Write, DB admin and Trending REST APIs)');
  });

  db.on('error', function (err) {
    console.log('MongoDB connection error', err);
  });

  db.once('open', function (err, res) {
    console.log('MongoDB connected to ' + systemSettings.dbUrl);
  });

  db.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
  });

  process.on('SIGINT', function() {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
    });
  });

  /**
  * @api {post} /services/v1/telemetry/kubos telemetry
  * @apiVersion 0.1.0
  * @apiName postTelemetry
  * @apiDescription upsert telemetry data points
  * @apiGroup Telemetry
  *
  * @apiSuccess {array} data array of position data points (qx,qy,qz,ex,ey,ez,qw,hum,temp)
  *
  * @apiParam {String} deviceId   IoT device id
  * @apiParam {Number} qx
  * @apiParam {Number} qy
  * @apiParam {Number} qz
  * @apiParam {Number} ex velocity for qx
  * @apiParam {Number} ey velocity for qy
  * @apiParam {Number} ez velocity for qz
  * @apiParam {Number} qw battery
  * @apiParam {Number} hum  humidity
  * @apiParam {Number} temp temperature
  *
  * @apiExample {curl} Example usage:
  * curl -X POST -H "Content-type: application/json" -d '{"deviceId":"IBEX","time":1457640420,"qx":236294.1956,
  * "qy":116196.8879,"qz":-34379.67682,"ex":-0.675287,"ey":0.508343,"ez":0.434496, 
  * "qw":123.4, "hum": 23.2, "temp": 34.10}'
  *        http://localhost:3000/services/v1/telemetry/kubos
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"upsert position data points",
  * "data":[{"_id":"56f3123e8caf28f687480f42", "deviceId":"IBEX","time":1457640420,"qx":236294.1956,
  * "qy":116196.8879,"qz":-34379.67682,"ex":-0.675287,"ey":0.508343,"ez":0.434496, 
  * "qw":123.4, "hum": 23.2, "temp": 34.10}]}
  *
  * @apiError (Error 500) {json} internal system error       The database is not ready to serve yet, e.g. after restart
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.post('/services/v1/telemtry/kubos', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var telemetryData = new Telemetry(req.body);
    telemetryData.time = Math.floor(new Date() / 1000);
    telemetryData.createdAt = new Date();
    telemetryData.save(function(err) {
      if (err) {
        return res.status(500).send({"status": 500, "message": "Cannot insert telemetry data points due to internal system error", 
          "type":"internal", "error": err});
      };

      // if no error
      return res.status(200).send( {"status": 200, "message": "insert all telemetry data points", "data": telemetryData} );
    });
  })

  /**
  * @api {post} /services/v1/simulation/telemetry/kubos/:nTimes  telemetry by deviceId/numberOfItems
  * @apiVersion 0.1.0
  * @apiName postTelemetry(deviceId, numberOfItems)
  * @apiDescription upsert telemetry data points by deviceId limited by numberOfItems
  * @apiGroup Telemetry
  *
  * @apiParam {String} deviceId device id
  * @apiParam {Number} x
  * @apiParam {Number} y
  * @apiParam {Number} z
  * @apiParam {Number} vx velocity for x
  * @apiParam {Number} vy velocity for y
  * @apiParam {Number} vz velocity for z
  * @apiParam {Number} numberOfItems  number of data elements to return
  *
  * @apiSuccess {array} data array of position data points (x,y,z,vx,vy,vz)
  *
  * @apiExample {curl} Example usage:
  * curl -X POST -H "Content-type: application/json" -d '{"vehicleId":"IBEX","timestamp":1457640420,"x":236294.1956,
  * "y":116196.8879,"z":-34379.67682,"vx":-0.675287,"vy":0.508343,"vz":0.434496}'
  *        http://localhost:3000/services/v1/simulation/position/2
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"upsert position data points",
  * "data":[{"_id":"56f3123e8caf28f687480f42","vehicleId":"IBEX","timestamp":1457640420,"x":236294.1956,
  * "y":116196.8879,"z":-34379.67682,"vx":-0.675287,"vy":0.508343,"vz":0.434496}]}
  *
  * @apiError (Error 500) {json} internal system error       The database is not ready to serve yet, e.g. after restart
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.post('/services/v1/simulation/telemetry/kubos/:nTimes', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var nTimes = parseInt(req.params.nTimes); 
    if (isNaN(nTimes) || (nTimes < 0)) {
      return res.status(300).send({"status": 300, "message": "User-related error encountered", "type":"user",
            "nTimes": nTimes,
            "error": "Please enter a valid number (nTimes)"});
    };
    
    if (nTimes > nTimesMax) {
      nTimes = nTimesMax;
    }

    var telemetryData = {};
    var dataList = [];
    for (var i=0; i < nTimes; i++) {
      telemetryData = new Telemetry(helper.getTelemetryData(400000.0, -400000.0, 20.0, -20.0));
      telemetryData.time = Math.floor(new Date() / 1000);
      telemetryData.createdAt = new Date();
      dataList.push(telemetryData);
    };

    var counter = 0;
    async.eachLimit(dataList, 5, function(item, callback) {
      telemetryData = new Telemetry(item);
      telemetryData.time = Math.floor(new Date() / 1000);
      telemetryData.createdAt = new Date();
      telemetryData.save(function(err, item) {
        if (err) {
          res.status(500).send({"status":500, "message": "Cannot insert telemetry data points due to internal system error", 
            "nTimes": nTimes, "counter": counter,
            "type":"internal", "error": err});
        };   

        // if no error
        counter++;
        if (counter  === dataList.length) {
          res.status(200).send( {"status": 200, "message": "create all telemetry data points", "data": JSON.stringify(dataList)} );
        };
        callback(err);
      });  
    });  
  })

/**
  * @api {post} /services/v1/admin/cleanup/telemetry telemetry
  * @apiVersion 0.1.0
  * @apiName dropTelemetry
  * @apiDescription drop Telemetry collection
  * @apiGroup Telemetry
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X POST -H "Content-type: application/json" http://localhost:3000/services/v1/admin/cleanup/telemetry
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"collection dropped"}
  *
  * @apiError (Error 500) {json} internal system error       cannot drop collection
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.post('/services/v1/admin/cleanup/telemetry', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    Telemetry.collection.remove(function(err) {
      if (err) {
          return res.status(500).send({"status":500, "message": "Cannot drop telemetry collection due to system errors.", 
            "type":"internal", "error": err});
      };

      return res.status(200).send({"status":200, "message": "telemetry collection dropped", "type":"client"});
    });
  });

  /**
  * @api {get} /services/v1/admin/metrics/telemetry/total/all telemetry metrics
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTotalAll
  * @apiDescription get Telemetry collection metrics total count
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/telemetry/total/all
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry metrics updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  // --- attitude

  app.get('/services/v1/admin/metrics/telemetry/total/all', function(req, res) {  
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var deviceId = req.params.deviceId;
    Telemetry.count(function(err, cnt) {
      if (err) {
          return res.status(500).send({"status": 500, "message": "Telemetry metrics update due to internal system error", 
            "type":"internal", "error": err});
      };
      console.log("Telemetry metrics updated. count=" + cnt);
      if (cnt > 0) {
        return res.status(200).send({"status": 200, "message": "Telemetry  metrics updated successfully.", 
        "collection": "telemetry",
        "count": cnt });
      } else {
        return res.status(300).send({"status": 300, "message": "Cannot find telemetry data. The database is empty.", 
        "collection": "telemetry" });
      };
    });
  });

  /**
  * @api {get} /services/v1/admin/metrics/telemetry/total/:deviceId telemetry metrics by deviceId
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTotalByDeviceId
  * @apiDescription get Telemetry collection metrics total count by deviceId
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/telemetry/total/IBEX
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry metrics updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/admin/metrics/telemetry/total/:deviceId', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var deviceId = req.params.deviceId;
    Telemetry.count({ "deviceId": deviceId}, function(err, cnt) {
      if (err) {
          return res.status(500).send({"status": 500,
            "message": "Telemetry metrics update due to internal system error", "type":"internal",
            "error": err});
      };
      
      if (cnt > 0) {
        return res.status(200).send({"status": 200, "message": "Telemetry metrics updated successfully.", 
        "collection": "telemetry", "deviceId": deviceId,
        "count": cnt });
      } else {
        return res.status(300).send({"status": 300, "message": "Cannot find telemetry data for device id " + deviceId, 
        "collection": "telemetry" });
      };
    });
  });

  /**
  * @api {get} /services/v1/admin/metrics/telemetry/total/:deviceId/:fromTS/:toTS telemetry metrics by time period
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTotalByTime
  * @apiDescription get Telemetry collection metrics total count by deviceId from/to time period
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/telemetry/total/IBEX/14258020640/1425600632
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry metrics updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/admin/metrics/telemetry/total/:deviceId/:fromTS/:toTS', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var deviceId = req.params.deviceId;
    var fromTS = req.params.fromTS;
    var toTS = req.params.toTS;

    if (isNaN(fromTS) || (fromTS < 0)) {
      return res.status(300).send({"status": 300, "message": "User-related error encountered", "type":"user",
            "error": "Please enter a valid number (fromTS)"});
    };
    if (isNaN(toTS) || (toTS < 0)) {
      return res.status(300).send({"status": 300, "message": "User-related error encountered", "type":"user",
            "error": "Please enter a valid number (toTS)"});
    };

    Telemetry.count({ "deviceId": deviceId,
       "time": { $gte: fromTS, $lte: toTS}}, function(err, cnt) {
      if (err) {
          return res.status(500).send({"status": 500, 
            "message": "Telemetry metrics update due to internal system error", "type":"internal", 
            "error": err});
      };
    
      if (cnt > 0) {
        return res.status(200).send({"status": 200, "message": "Telemetry metrics updated successfully.", 
        "collection": "telemetry", "deviceId": deviceId,
        "fromTS": fromTS, "toTS": toTS, 
        "count": cnt });
      } else {
        return res.status(300).send({"status": 300, "message": "Cannot find telemetry data for device id " + deviceId, 
        "collection": "telemetry",
        "fromTS": fromTS, "toTS": toTS, 
        "count": cnt });
      };
    });
  });

  // --- Data Aggregation framework example
  /**
  * @api {get} /services/v1/admin/metrics/trend/telemetry/all telemetry usage trend
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTrendAll
  * @apiDescription get telemetry collection metrics trend in ascending order
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/trend/telemetry/all
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry trending metrics updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/admin/metrics/trend/telemetry/all', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    Attitude.aggregate([
      {$group : {
        _id : { eventDate : "$timestamp" },
        subtotal: { $sum: 1}
      }},
      {$sort: { "time": 1}}
      ],
      function(err,data) {
        if (err) {
          return res.status(500).send({"status": 500,
            "message": "Cannot extract telemetry  metrics trending due to internal system error", "type":"internal",
            "error": err});
        } else {
          return res.status(200).send({"status": 200, "message": "Telemetry metrics trending updated successfully.",  
            "collection": "telemetry",
            "trend": data});
        }
      }
    ) 
  });

   // --- Data Aggregation framework example
  /**
  * @api {get} /services/v1/admin/metrics/trend/telemetry/:nLimit telemetry usage trend nLimit
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTrendAll
  * @apiDescription get telemetry collection metrics trend in ascending order
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/trend/telemetry/4
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry trending metrics updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/admin/metrics/trend/telemetry/:nLimit', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var limitResultset = parseInt(req.params.nLimit);
    if (limitResultset > 9999) {
      limitResultset = 9999;
    } else if (limitResultset < 1) {
      limitResultset = 1;
    }

    Telemetry.aggregate([
      {$group : {
        _id : { eventDate : "$timestamp" },
        subtotal: { $sum: 1}
      }},
      {$sort: { "time": -1}},
      {$limit: limitResultset },
      {$sort: { "time": -1}}
      ],
      function(err,data) {
        if (err) {
          return res.status(500).send({"status": 500,
            "message": "Cannot extract telemetry metrics trending due to internal system error", "type":"internal",
            "error": err});
        } else {
          return res.status(200).send({"status": 200,"message": "Telemetry metrics trending updated successfully.",  
            "collection": "telemetry",
            "trend": data});
        }
      }
    ) 
  });

  /**
  * @api {get} /services/v1/admin/metrics/trend/telemetry/by/:deviceId telemetry usage trend
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTrendByDeviceId
  * @apiDescription get telemetry collection metrics trend by deviceId  in ascending order
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/trend/attitude/by/IBEX
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry trending metrics by vehicleId updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/admin/metrics/trend/telemetry/by/:deviceId', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var deviceId = req.params.deviceId;
    Telemetry.aggregate([
      {$match: { "deviceId": deviceId}},
      {$group : {
        _id : { eventDate : "$timestamp" },
        subtotal: { $sum: 1}
      }},
      {$sort: { "time": 1}}
      ],
      function(err,data) {
        if (err) {
          return res.status(500).send({"status": 500,
            "message": "Cannot extract telemetry metrics trending due to internal system error", "type":"internal",
            "deviceId": deviceId,
            "error": err});
        } else {
          return res.status(200).send({"status": 200,"message": "Telemetry metrics trending updated successfully.",  
            "collection": "telemetry",
            "trend": data});
        }
      }
    )
  });

  /**
  * @api {get} /services/v1/admin/metrics/trend/telemetry/:deviceId/:nLimit attitude usage trend nLimit
  * @apiVersion 0.1.0
  * @apiName getMetricsTelemetryTrendByDeviceId
  * @apiDescription get telemetry collection metrics trend by deviceId  in ascending order
  * @apiGroup Analytics
  *
  *
  * @apiSuccess {boolean} success
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/admin/metrics/trend/telemetry/IBEX/2
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"Telemetry trending metrics by deviceId updated successfully."}
  *
  * @apiError (Error 500) {json} internal system error     no metrics collected
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/admin/metrics/trend/telemetry/:deviceId/:nLimit', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var limitResultset = parseInt(req.params.nLimit);
    if (limitResultset > 9999) {
      limitResultset = 9999;
    } else if (limitResultset < 1) {
      limitResultset = 1;
    }

    var deviceId = req.params.deviceId;
    Telemetry.aggregate([
      {$match: { "deviceId": deviceId}},
      {$group : {
        _id : { eventDate : "$timestamp" },
        subtotal: { $sum: 1}
      }},
      {$sort: { "time": -1}},
      {$limit: limitResultset },
      {$sort: { "time": -1}}
      ],
      function(err,data) {
        if (err) {
          return res.status(500).send({"status": 500, "message": "Internal system error encountered", "type":"internal"});
        } else {
          return res.status(200).send({"status": 200, "message": "Telemetry metrics trending updated successfully.",  
            "collection": "telemetry",
            "trend": data});
        }
      }
    )
  });

/**
  * @api {get} /services/v1/telemetry/kubos  telemetry
  * @apiVersion 0.1.0
  * @apiName getTelemetry
  * @apiDescription return all telemetry data points based on Kubos (open source cube satellites) telemetry format
  * @apiGroup Telemetry
  *
  * @apiSuccess {array} data array of telemetry data, including qx,qy,qy,ex,ey,ey,qw,hum,temp
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/telemetry/kubos
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {"status":200,"message":"retrieve all attitude data points",
  *        "data":[{"_id":"56f312e98caf28f687482b5f","deviceId":"IBEX",
  *        "time":1457726400,"qx":0.651781,"qy":-0.29526,"qz":-0.268266,
  *        "ex":0.651781,"ey":-0.29526,"ez":-0.268266,
  *        "qw":0.645009, "hum": 23.1, "temp": 97.1}]}
  *
  * @apiError (Error 500) {json} message internal system error       The database is not ready to serve yet, e.g. after restart
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 message Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/telemetry/kubos', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    Telemetry.find({}, function(err, data) {
      if (err) {
        return res.status(500).send({"status": 500, "message": "Cannot read telemetry data points due to internal system error", "type":"internal"});
      } else {
        return res.status(200).send( {"status": 200, "message": "retrieve all telemetry data points", "data": data} );
      }
    }).limit(nTimesMax);
  });

  /**
  * @api {get} /services/v1/telemetry/:deviceId/:nLimit  attitude by deviceId/numberOfItems
  * @apiVersion 0.1.0
  * @apiName getTelemetry(deviceId, numberOfItems)
  * @apiDescription return telemetry data points by deviceId limited by numberOfItems
  * @apiGroup Telemetry
  *
  * @apiParam {String} deviceId   device id
  * @apiParam {Number} numberOfItems  number of data elements to return
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/telemetry/kubos/IBEX/5
  *
  * @apiSuccess {array} data array of telemetry data, including qx,qy,qy,ex,ey,ey,qw,hum,temp
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  * {"status":200,"message":"retrieve all attitude data points",
  *        "data":[{"_id":"56f312e98caf28f687482b5f","deviceId":"IBEX",
  *        "time":1457726400,"qx":0.651781,"qy":-0.29526,"qz":-0.268266,
  *        "ex":0.651781,"ey":-0.29526,"ez":-0.268266,
  *        "qw":0.645009, "hum": 23.1, "temp": 97.1}]}
  *
  * @apiError (Error 500) {json} internal system error       The database is not ready to serve yet, e.g. after restart
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/telemetry/kubos/:deviceId/:nLimit', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var deviceId = req.params.deviceId;
    var limitResultset = parseInt(req.params.nLimit);
    if (limitResultset > 9999) {
      limitResultset = 9999;
    } else if (limitResultset < 1) {
      limitResultset = 1;
    }

    Telemetry.aggregate([{$match: { "deviceId": deviceId}}, {$sort: { "time": -1}}, 
      {$limit: limitResultset }, {$sort: { "time": -1} } ], 
      function(err,data) {
        if (err) {
          return res.status(400).send({"status": 400, "message": "Invalid input parameter or option", "type":"client",
            "deviceId": deviceId,
            "nLimit": limitResultset
          });
        } else {
            res.status(200).send( {"status": 200, "message": "retrieve all telemetry data points", 
              "deviceId": deviceId,
              "nLimit": limitResultset,
              "data": data} );
        }
      });
    });

 /**
  * @api {get} /services/v1/telemetry/:deviceId/:fromTS/:toTS attitude by deviceId/from/to
  * @apiVersion 0.1.0
  * @apiName getTelemetry(deviceId, fromTime, toTime)
  * @apiDescription return telemetry data points from time/to time by deviceId
  * @apiGroup Telemetry
  *
  * @apiParam {String} deviceId    device id
  * @apiParam {Number} fromTime    from time period (Unix time in number, e.g. 1457726400)
  * @apiParam {Number} toTime      to time period (Unix time in number)
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/services/v1/telemetry/kubos/IBEX/10000/1457725800
  *
  * @apiSuccess {array} data array of telemetry data, including qx,qy,qy,ex,ey,ey,qw,hum,temp
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  * {"status":200,"message":"retrieve all attitude data points",
  *        "data":[{"_id":"56f312e98caf28f687482b5f","deviceId":"IBEX",
  *        "time":1457726400,"qx":0.651781,"qy":-0.29526,"qz":-0.268266,
  *        "ex":0.651781,"ey":-0.29526,"ez":-0.268266,
  *        "qw":0.645009, "hum": 23.1, "temp": 97.1}]}
  *
  * @apiError (Error 500) {json} internal system error       The database is not ready to serve yet, e.g. after restart
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Internal system error encoutered
  * 
  *     {"message":"Internal system error encountered","type":"internal"}
  **/
  app.get('/services/v1/telemetry/:deviceId/:fromTS/:toTS', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // process input parameters
    var deviceId = req.params.deviceId;
    var fromTS = parseInt(req.params.fromTS);
    if (fromTS < 1) {
      fromTS = 0;
    }

    if (toTS < 1) {
      toTS = 0;
    }
    var toTS = parseInt(req.params.toTS);

    Telemetry.aggregate([{$match: {$and: [{ "deviceId": deviceId}, 
      { "time": { $gte: fromTS, $lte: toTS}} ]}}, 
      {$sort: { "time": -1}},         
      {$limit: 10 }, {$sort: { "time": -1} } 
      ],
      function(err,data) {
        if (err) {
          return res.status(400).send({"status": 400, "message": "Invalid input parameter or option", "type":"client",
            "deviceId": deviceId, "fromTS": fromTS, "toTS": toTS
          });
        } else {
          return res.status(200).send({"status": 200, "message": "retrieve all telemetry data points", 
            "deviceId": deviceId, "fromTS": fromTS, "toTS": toTS,
            "data": data} );
        }
      }
    );
  });

// end of module
};
