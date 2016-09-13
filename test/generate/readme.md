# How to generate seed data for testing
Updated: Jul 15, 2016

To test your IoT platform, you need to seed (aka generate test data for initial load) data so that your IoT platform or widgets can use.

3 helper classes are available. The syntax is:

generateXXXSeedData.sh <database username> <database password>

## Pre-reqeuisites
* You need to install mongo shell.
Refer to https://docs.mongodb.com/manual/mongo/ for details.

## When to Run
* After you install IoT platform, you can change directory to /test/generate, and run the following commands:

```
./generateTelemetrySeedData.sh myapp admin2016
```

* If you just zap (reset) the database, you can also re-run these commands.

* You can run these scripts in a for loop. 
