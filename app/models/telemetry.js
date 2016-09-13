// Program: telemetry.js
// Purpose: database schema
// Author:  Ray Lai
// Updated: May 24, 2016
//

var mongoose = require('mongoose');
var telemetrySchema = new mongoose.Schema({
  deviceId: String,
  qx: Number,
  qy: Number,
  qz: Number,
  ex: Number,
  ey: Number,
  ez: Number,
  qw: Number,
  hum: Number,
  temp: Number,
  time: Number,
  createdAt: Date
}, { collection: 'telemetry'});

module.exports = mongoose.model('Telemetry', telemetrySchema);