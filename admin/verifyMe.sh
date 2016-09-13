#!/bin/bash
# Program: verifyMe.sh
# Purpose: to verify if your docker hosts are set up and configured correctly
#          this requires semi-manual check for the correct config values
# Author:  Ray Lai
# Updated: Aug 12, 2016
#

# in future, you can pass as parameter, e.g. $1
. ./devopsSettings.sh
echo "Checking folder structure"
echo "...checking Build folders /mnt/data/prod"
if [ -d "$FOLDER_PROD" ]; then
  echo "$FOLDER_PROD folder exists"
  if [ -d "$FOLDER_PROD/angular" ]; then
     echo "$FOLDER_PROD/angular folder OK"
  else
     echo "==> Missing $FOLDER_PROD/angular folder"
  fi
  if [ -d "$FOLDER_PROD/platform" ]; then
     echo "$FOLDER_PROD/platform folder OK"
  else
     echo "==> Missing $FOLDER_PROD/platform folder"
  fi
  if [ -d "$FOLDER_PROD/mqclient" ]; then
     echo "$FOLDER_PROD/mqclient folder OK"
  else 
     echo "==> Missing $FOLDER_PROD/mqclient folder"
  fi
fi

echo "checking config file value under $FOLDER_PROD/config"

grep $PORT_ANGULAR < $FOLDER_PROD/config/clientSettings.js 


echo "...checking REST API port used by MQ Client " $PORT_MQCLIENT
grep $PORT_MQCLIENT < $FOLDER_PROD/config/clientSettings.js 

echo "...checking WebSocket service Endpoint " $WEBSOCKET_URL
grep $WEBSOCKET_URL < $FOLDER_PROD/config/clientSettings.js 
