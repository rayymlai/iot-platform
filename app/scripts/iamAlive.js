// Program: iamAlive.js 
// Purpose: application heartbeat module to show the app is alive.
// Author:  Ray Lai
// Updated: Sep 12, 2016
// License: MIT license
//
module.exports = function(app) {
  console.log("/iamAlive.js - iamAlive is loaded.");
  
  /**
  * @api {get} /iamAlive system heartbeat
  * @apiVersion 0.1.0
  * @apiName iamAlive
  * @apiDescription application heartbeat module to show the app is alive.
  * @apiGroup System
  *
  * @apiSuccess {String} message system status about the platform
  *
  * @apiExample {curl} Example usage:
  * curl -X GET http://localhost:3000/iamAlive
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "message": "IoT platform is alive"
  *     }
  *
  * @apiError (Error 500) {json} N/A Not applicable
  *
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 500 Not Found
  *     {
  *       "error": "Internal system error. Please check with system administrator to restart servers."
  *     }
  **/
	app.get('/verifyMe', function(req, res) {
		res.json({'message': 'IoT platform is alive'});
	});
};
