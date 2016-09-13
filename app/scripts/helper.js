// Program: helper.js
// Purpose: data generator helper class
// Author:  Ray Lai
// Updated: Apr 25, 2016
// License: MIT license
//

var systemSettings = require('../../config/systemSettings.js');
var randomstring = require('randomstring');

console.log("/helper.js - helper classes loaded.");

/**
 * @api {javascript} getTelemetryData randomize telemetry
 * @apiVersion 0.1.0
 * @apiName getTelemetryData
 * @apiDescription generate random telemetry data (mock or testing)
 * @apiGroup Helper
 *
 **/
exports.getTelemetryData = function(high, low, velocityHigh, velocityLow) {
  var testData = {};
  var vehicleId = exports.getVehicleId();
  var qx = Math.random() * (high - low) + low;
  var qy = Math.random() * (high - low) + low;
  var qz = Math.random() * (high - low) + low;
  var ex = Math.random() * (velocityHigh - velocityLow) + velocityLow;
  var ey = Math.random() * (velocityHigh - velocityLow) + velocityLow;
  var ez = Math.random() * (velocityHigh - velocityLow) + velocityLow;
  var qw = Math.random() * (high - low) + low;
  var hum = Math.random() * (high - low) + low;
  var temp = Math.random() * (high - low) + low;
  var timestamp = Math.floor(new Date() / 1000);

  testData = { "deviceId": deviceId, "qx": Number(qx.toFixed(4)), "qy": Number(qy.toFixed(4)), "qz": Number(qz.toFixed(4)),
    "ex": Number(ex.toFixed(6)), "ey": Number(ey.toFixed(6)), "ez": Number(ez.toFixed(6)),
    "qw": Number(qw.toFixed(6)), "hum": Number(hum.toFixed(6)), "temp": Number(temp.toFixed(6)),
    "time": timestamp };
  return testData;
};

/**
 * @api  {javascript} getDeviceId randomize IoT device names
 * @apiVersion 0.1.0
 * @apiName getDeviceId
 * @apiDescription generate random IoT device id 
 * @apiGroup Helper
 *
 **/
exports.deviceId = function() {
  var deviceId = systemSettings.deviceId;
  var x = Math.round((Math.random() * vehicles.length) - 1);
  return deviceId[x];
}

