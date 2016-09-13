// Program: socketConsole.js
// Purpose: display generated data on browser client when received
// Author:  Ray Lai
// Updated: Jun 6, 2016
// License: MIT license
//

// 8/11/2016 RayL: replace socket server endpoint with config file instead of inline codes
// index.html will load clientSettings.js to instantiate 'webSocketEndpoint'
var socket = io(webSocketEndpoint);

socket.on('connection', function() {
  console.log("/socketConsole.js - webSocket server console loaded.");
  //alert("connected");
});

socket.on('error', console.error.bind(console));

socket.on('attitude', function(telemetryData) {  
  console.log("Data: " + JSON.stringify(telemetryData));
});

socket.on('position', function(telemetryData) {  
  console.log("Data: " + JSON.stringify(telemetryData));
});

socket.on('vehicle', function(telemetryData) {  
  console.log("Data: " + JSON.stringify(telemetryData));
});

socket.on('orbit', function(telemetryData) {  
  console.log("Data: " + JSON.stringify(telemetryData));
});
