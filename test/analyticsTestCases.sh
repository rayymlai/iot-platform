// Program: analyticsTestCases.js
// Purpose: Testing using mocha
// Author:  Ray Lai
// Updated: Sep 13, 2016
// License: MIT license

process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require("mongoose");
var server = require('../../server/app');
var Telemetry = require("../../server/models/telemetry");
var should = chai.should();
var url = require('url');
chai.use(chaiHttp);
var supertest = require("supertest");
var server = supertest.agent("http://rezel.monkieblankie.com:4101");

// *** UNIT test begin ***//
// *** GET - REST API For Analytics - telemetry metrics by time period  ***//

describe(" GET - REST API For Analytics telemetry by deviceId and timestamp", function(){
    it("GET /services/v1/admin/metrics/telemetry/total/:deviceId/:fromTS/:toTS should return 200",function(done){
        server
            .get("/services/v1/admin/metrics/telemetry/total/:deviceId/:fromTS/:toTS")
            .end(function(err,res){
                console.log (res.should.have);
                res.status.should.equal(300);
                res.body.message.should.equal("User-related error encountered");
                res.body.message.should.not.equal("retrieve all telemetry metrics");
                res.body.should.have.property("message");
                res.body.should.have.property("status");
                res.body.should.have.property("type");
                res.body.should.have.property("error");
                done();
            });
    });
});

// *** GET - REST API For Analytics - telemetry metrics total count  ***//
describe(" GET - REST API For Analytics telemetry metrics total count", function() {
    // #1 200 should return all total count
    it("GET /services/v1/admin/metrics/telemetry/total/all - should return 200", function (done) {
        server
            .get("/services/v1/admin/metrics/telemetry/total/all")
            .end(function (err, res) {
                //console.log (res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("Telemetry metrics updated successfully.");
                res.body.message.should.not.equal("retrieve all telemetry metrics");
                res.body.should.have.property("message");
                res.body.should.have.property("collection");
                res.body.should.have.property("count");
                res.body.collection.should.equal("telemetry");
                done();
            });
    });
});

// *** GET - REST API For Analytics - telemetry usage trend by deviceId ***//
describe(" GET - REST API For Analytics telemetry usage trend", function() {
    // #1 200 should return all total count
    it("GET /services/v1/admin/metrics/trend/telemetry/by/:deviceId - should return 200", function (done) {
        server
            .get("/services/v1/admin/metrics/trend/telemetry/by/:deviceId")
            .end(function (err, res) {
                console.log(res.should.have);
                res.status.should.equal(200);
                res.body.message.should.equal("Telemetry metrics trending updated successfully.");
                res.body.message.should.not.equal("retrieve all telemetry metrics");
                res.body.should.have.property("status");
                res.body.should.have.property("message");
                res.body.should.have.property("collection");
                res.body.collection.should.equal("telemetry");
                res.body.should.have.property("trend");
                done();
            });
    });
});

