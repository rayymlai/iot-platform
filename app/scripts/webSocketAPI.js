// Program: webSocketAPI.js
// Purpose: webSocket server for data streaming
// Author:  Ray Lai
// Updated: May 31, 2016
// License: MIT license
// 
module.exports = function(app, socketPort, syslogger, logger, helper) {
  var socketServer = require('http').createServer(app);
  var io = require('socket.io').listen(app.listen(socketPort, function() {
     console.log('non-SSL socket.io Server listening at socket port %d ', socketPort);
  }));

  io.sockets.emit('connection');

  io.on('connection', function(socket) {
    console.log("socket.io Server connected.")
    socket.emit('connection', 'IoT socket.io server connected');

    // broadcast telemetry data from sender
    socket.on('heartbeat', function(data) {
      socket.broadcast.emit('heartbeat', data);
    });

  });
    
  io.on('close', function(socket) {
    console.log("socket.io Server connection closed.");
  });

// end of module
};
