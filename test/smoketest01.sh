#!/bin/bash
# Program: smoketest01.sh
# Purpose: automated test using curl
# Author:  Ray Lai
# Updated: Jul 11, 2016
# Remark:  make sure you change SERVERENDPOINT to the right URL
#SERVERENDPOINT='http://localhost:3000'
SERVERENDPOINT='http://jesta.monkieblankie.com:4101'
NOW=$(date +"%Y-%m-%d")
TESTOKRESULT="automatedTest-log-$NOW.log"
TESTERR="automatedTest-err-$NOW.log"

# clean up files, reset test reports
if [ -f $TESTOKRESULT ]; 
then
  rm $TESTOKRESULT
fi

if [ -f $TESTERR ];
then
  rm $TESTERR
fi

# write header
echo "Empty database first in order to have a clean slate"
echo "IoT platform automated test - " $NOW  >> $TESTOKRESULT
echo "-------------------------------------------------" >> $TESTOKRESULT
echo "IoT platform automated test - " $NOW >> $TESTERR
echo "-------------------------------------------------" >> $TESTERR

echo
echo "Checking if read is successful"

# syntax: isReadOK UrlEndpoint description
isReadOK() {
  X=`curl -X GET $1 | grep status | sed -e 's/[{}]/''/g' | awk -v k="text" '{n=split($0,a,","); print a[1]}' | awk -v k="text" '{n=split($0,a,":"); print a[2]}'`
  if [ $X = "200" ];
then
  echo $1 " - " $2 " OK "  `date`
  echo $1 " - " $2 " OK " `date` >> $TESTOKRESULT
else
  echo $1 " - " $2 " error " `date`
  echo $1 " - " $2 " error " `date`  >> $TESTERR
fi
}

# syntax: isWriteOK UrlEndpoint 
isWriteOK() {
Y=`curl -X POST -H "Content-type: application/json" $1 | grep status | sed -e 's/[{}]/''/g' | awk -v k="text" '{n=split($0,a,","); print a[1]}' | awk -v k="text" '{n=split($0,a,":"); print a[2]}'`
if [ $Y = "200" ];
then
  echo $1 " - " $3 " OK "  `date`
  echo $1 " - " $3 " OK " `date` >> $TESTOKRESULT
else
  echo $1 " - " $3 " error " `date`
  echo $1 " - " $3 " error " `date`  >> $TESTERR
fi
}


# POST telemetry
postTelemetryOK() {
Y3=`curl -X POST -H "Content-type: application/json" -d '{"deviceId":"Battery-sIQ","calibrationFactor":"-0.5146501450155723","warnLow":-404.16251414750116,"warnHigh":48.34560267826693,"alertLow":271.53661524505407,"alertHigh":545.3523380183927,"uom":"Kevin","value":229.7520535794023,"vehicleId":"Orion MPCV"}' $1 | grep status | sed -e 's/[{}]/''/g' | awk -v k="text" '{n=split($0,a,","); print a[1]}' | awk -v k="text" '{n=split($0,a,":"); print a[2]}'`

if [ $Y3 = "200" ];
then
  echo $1 " - " $2 " OK "  `date`
  echo $1 " - " $2 " OK " `date` >> $TESTOKRESULT
else
  echo $1 " - " $2 " error " `date`
  echo $1 " - " $2 " error " `date`  >> $TESTERR
fi 
}


# syntax: testCase description
testCase() {
  echo
  echo $1 >> $TESTOKRESULT
  echo $1 >> $TESTERR
  echo $1
  echo "--------------" >> $TESTOKRESULT
  echo "--------------" >> $TESTERR
  echo "--------------"
}

# basic read to see if database access is available
testCase "Test 1 - checking if database access is available"
isReadOK $SERVERENDPOINT/services/v1/telemetry " read "

# clean up database
testCase "Test 2 - zap database collections "
isWriteOK $SERVERENDPOINT/services/v1/admin/cleanup/telemetry " cleanup "

testCase "Test 3 - database collection should be empty now "
postAttitudeOK $SERVERENDPOINT/services/v1/telemetry " empty "

testCase "Checking if data collection is empty after insert"
isReadOK $SERVERENDPOINT/services/v1/telemetry " read "

# generate seed data
isWriteOK $SERVERENDPOINT/services/v1/simulation/telemetry/1000 " generate 1000 attitude rows "

# read 1000 back
testCase "Checking if data collection is empty after insert"
isReadOK $SERVERENDPOINT/services/v1/telemetry/CST-100%20Starliner/1000 " read "

# test metrics
testCase "Test 4 - test metrics showing total - all"
isReadOK $SERVERENDPOINT/services/v1/admin/metrics/telemetry/total/all " telemetry metrics "

testCase "Test 4 - test metrics showing total - by deviceId"
isReadOK $SERVERENDPOINT/services/v1/admin/metrics/telemetry/total/CST-100%20Starliner " telemetry metrics by deviceId "

# test trending
testCase "Test 4 - test trending - all"
isReadOK $SERVERENDPOINT/services/v1/admin/metrics/trend/telemetry/all " telemetry trending "

# test trending with nLimit
testCase "Test trending - nLimit"
isReadOK $SERVERENDPOINT/services/v1/admin/metrics/trend/telemetry/10 " telemetry trending nLimit "

# test trending by deviceId
testCase "Test trending by deviceId"
isReadOK $SERVERENDPOINT/services/v1/admin/metrics/trend/telemetry/by/CST-100%20Starliner " telemetry trending by vehicle "

# test trending by deviceId with nLimit
testCase "Test trending by deviceId with nLimit"
isReadOK $SERVERENDPOINT/services/v1/admin/metrics/trend/telemetry/CST-100%20Starliner/5 " telemetry trending by vehicle "

# housekeeping: reset and clean up database
testCase "Test 5 - zap database collections "
isWriteOK $SERVERENDPOINT/services/v1/admin/cleanup/telemetry " reset db "

# add 1 single record
testCase "Test 6 - insert 1 record per collection 
postTelemetryOK $SERVERENDPOINT/services/v1/telemetry " insert 1 telemetry data point "

