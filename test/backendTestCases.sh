// Program: backendTestCases.js
// Purpose: Testing using mocha
// Author:  Ray Lai
// Updated: Sep 13, 2016
// License: MIT license

process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require("mongoose");
var server = require('../server/app');
var Telemetry = require("../server/models/telemetry");
var should = chai.should();
var url = require('url');
chai.use(chaiHttp);
var supertest = require("supertest");
var server = supertest.agent("http://rezel.monkieblankie.com:4101");

// *** UNIT test begin ***//
// *** GET - REST API For Telemetry position ***//
describe('GET - REST API For Telemetry attitude by deviceId and time', function() {      
    it('GET /services/v1/telemetry', function(done) { 
       server 
        .get('/services/v1/telemetry') 
        .end(function(err, res){ 
            console.log(res.should.have); 
            res.should.have.status(200); 
            res.should.be.json; 
            res.body.should.be.a('Object'); 
            res.body.should.have.property('status'); 
            res.body.should.have.property('message'); 
            res.body.should.have.property('data');
            res.body.message.should.equal("retrieve all telemetry data points");
            res.body.message.should.not.equal("retrieve all telemetry");
            done(); 
         }); 
    });     
 });

// *** GET - REST API For Telemetry by deviceId from time to time ***//
describe(" GET - REST API For Telemetry by deviceId and time", function(){
    it("GET /services/v1/telemetry/:deviceId/:fromTS/:toTS - should return 200",function(done){
        server
            .get("/services/v1/telemetry/:deviceId/:fromTS/:toTS")
            .end(function(err,res){
                console.log (res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("retrieve all telemetry data points");
                res.body.message.should.not.equal("retrieve all telemetry");
                res.body.should.have.property("status");
                res.body.should.have.property("message");
                res.body.should.have.property("data");
                var url_parts = url.parse('/telemetry?deviceId=IBEX&fromTime=10000&toTime=1457725800',true);
                var vehicle = url_parts.query.vId;
                var fromTime = url_parts.query.fromTime;
                var toTime = url_parts.query.toTime;
                //checking parameters -- This test will fail
                // res.body.data[0].deviceId.should.equal(deviceId);
                done();
            });
    });
});

// *** GET - REST API For Telemetry telemetry by deviceId and numberOfItems ***//
describe("GET - REST API For Telemetry telemetry by deviceId and numberOfItems",function() {
    // #1 should return 200 success and checking data parameters and url params
    it("GET /services/v1/telemetry/:deviceId/:nLimit", function (done) {
        var deviceId = new Telemetry({
            deviceId: 'IBEX',
            nLimit:2
        });
        deviceId.save(function(err, data) {
            server
                .get("/services/v1/telemetry/" + data.deviceId + '/' + data.nLimit)
                .end(function (err, res) {
                    console.log (res.should.have);
                    // HTTP status should be 200
                    res.status.should.equal(200);
                    res.body.message.should.equal("retrieve all telemetry data points");
                    res.body.message.should.not.equal("retrieve all telemetry");
                    res.body.should.have.property("status");
                    res.body.should.have.property("message");
                    res.body.should.have.property("data");
                    for(var dataLength=0; dataLength<res.body.data.length; dataLength++){
                        res.body.data[dataLength].should.have.property("_id");
                        //res.body.data[dataLength].should.have.property("time");
                        res.body.data[dataLength].should.have.property("deviceId");
                        //res.body.data[dataLength].should.have.property("qx");
                        //res.body.data[dataLength].should.have.property("qy");
                        //res.body.data[dataLength].should.have.property("qz");
                        //res.body.data[dataLength].should.have.property("qw");
                        res.body.data[dataLength].should.have.property("__v");
                    }
                    done();
                });
        });
    });
});


// *** POST - REST API For Telemetry telemetry by deviceId and numberOfItems ***//
describe("POST - REST API For Telemetry telemetry by deviceId and numberOfItems", function () {
    //#1 insert telemetry data points by deviceId limited by numberOfItems
    it("should return 200 and check all parameters", function (done) {
        server
            .post("/services/v1/telemetry")
            .send({
                "deviceId": "IBEX",
                "time": 1468426687,
                "qx": 0.651781,
                "qy": -0.29526,
                "qz": -0.268266,
                "qw": 0.645009
            })
            .end(function (err, res) {
                console.log (res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("insert telemetry data points");
                res.body.should.have.property("status");
                res.body.should.have.property("message");
                res.body.should.have.property("data");
                res.body.data.should.have.property("deviceId");
                res.body.data.vehicleId.should.equal("IBEX");
                res.body.data.should.have.property("time");
                res.body.data.should.have.property("qx");
                res.body.data.q1.should.equal(0.651781);
                res.body.data.should.have.property("qy");
                res.body.data.q2.should.equal(-0.29526);
                res.body.data.should.have.property("qz");
                res.body.data.q3.should.equal(-0.268266);
                res.body.data.should.have.property("qw");
                res.body.data.q4.should.equal(0.645009);
                done();
            });
    });
});

// *** POST - REST API For Telemetry drop telemetry collection ***//
describe("POST - REST API For Telemetry drop telemetry collection",function () {
    //#1 drop telemetry collection
    it("POST /services/v1/admin/cleanup/telemetry - should return 200", function (done) {
        server
            .post("/services/v1/admin/cleanup/telemetry")
            .end(function (err, res) {
                // console.log(res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("telemetry collection dropped");
                res.body.message.should.not.equal("retrieve all telemetry");
                done();
            });
    });
});

// *** POST - REST API For Telemetry insert telemetry data points ***//
describe("POST - REST API For Telemetry insert telemetry data points",function () {
    //#1 insert telemetry data
    it("POST /services/v1/telemetry - should return 200", function (done) {
        server
            .post("/services/v1/telemetry")
            .send({
                "deviceId": "IBEX",
                "time": 1457726400,
                "qx": 0.651781,
                "qy": -0.29526,
                "qz": -0.268266,
                "qw": 0.645009
            })
            .end(function (err, res) {
                console.log(res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("insert telemetry data points");
                res.body.message.should.not.equal("retrieve all telemetry");
                res.body.data.should.have.property("deviceId");
                res.body.data.vehicleId.should.equal("IBEX");
                res.body.data.should.have.property("time");
                res.body.data.should.have.property("qx");
                res.body.data.q1.should.equal(0.651781);
                res.body.data.should.have.property("qy");
                res.body.data.q2.should.equal(-0.29526);
                res.body.data.should.have.property("qz");
                res.body.data.q3.should.equal(-0.268266);
                res.body.data.should.have.property("qw");
                res.body.data.q4.should.equal(0.645009);
                done();
            });
    });
});

// *** POST - REST API For Telemetry send telemetry data points to MQ ***//
describe("POST - REST API For Telemetry send telemetry data points to MQ",function () {
    //#1 send attitude data points to MQ
    it("POST /services/v1/messaging/telemetry/:topic - should return 200", function (done) {
        server
            .post("/services/v1/messaging/telemetry/customer1.device1.telemetry")
            .send({
                "deviceId": "IBEX",
                "time": 1457726400,
                "qx": 0.651781,
                "qy": -0.29526,
                "qz": -0.268266,
                "qw": 0.645009
            })
            .end(function (err, res) {
                console.log(res.should.have);
                res.status.should.equal(200);
               // res.body.message.should.equal("send telemetry data points to message queue");
                res.body.message.should.not.equal("retrieve all data telemetry");
                res.body.data.should.have.property("deviceId");
                res.body.data.vehicleId.should.equal("IBEX");
                res.body.data.should.have.property("time");
                res.body.data.should.have.property("qx");
                res.body.data.q1.should.equal(0.651781);
                res.body.data.should.have.property("qy");
                res.body.data.q2.should.equal(-0.29526);
                res.body.data.should.have.property("qz");
                res.body.data.q3.should.equal(-0.268266);
                res.body.data.should.have.property("qw");
                res.body.data.q4.should.equal(0.645009);
                done();
            });
    });

    //#2 send telemetry data points to MQ
    it("POST /services/v1/messaging/telemetry/:topic - should return 200",function(done){
        server
            .post("/services/v1/messaging/telemetry/kubos.telemetry")
            .send({"deviceId": "IBEX","time" : 1457726400, "qx":0.651781, "qy": -0.29526, "qz": -0.268266, "qw": 0.645009 })
            .end(function(err,res){
                console.log(res.should.have);
                res.status.should.equal(200);
                res.body.message.should.not.equal("retrieve all data telemetry");
                res.body.data.should.have.property("deviceId");
                res.body.data.vehicleId.should.equal("IBEX");
                res.body.data.should.have.property("time");
                res.body.data.should.have.property("qx");
                res.body.data.q1.should.equal(0.651781);
                res.body.data.should.have.property("qy");
                res.body.data.q2.should.equal(-0.29526);
                res.body.data.should.have.property("qz");
                res.body.data.q3.should.equal(-0.268266);
                res.body.data.should.have.property("qw");
                res.body.data.q4.should.equal(0.645009);
                done();
            });
    });
});

// *** GET - REST API For System heartbeat- verify if system is alive ***//

describe(" GET - REST API For System heartbeat- verify if system is alive", function() {
    //#1 should return 200
    it("should return 200", function (done) {
        server
            .get("/iamAlive")
            .end(function (err, res) {
                console.log(res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("IoTplatform is alive");
                res.body.message.should.not.equal("retrieve all metrics");
                res.body.should.have.property("message");
                done();
            });
    });
});

