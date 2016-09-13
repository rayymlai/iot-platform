# IoT Platform Framework
Updated: Sep 13, 2016 by Ray Lai

The IoT-platform (Internet of Things) framework project is the backend module that provides device discovery, data management and administration for IoT devices.  IoT devices can be smart things, smart home devices, smart watches, smart meters, or even cube satellites. The platform framework adopts an API-centric architecture with the integration with WebSockets (for real time data streaming), RabbitMQ messaging (for reliable and resilient transaction handling) and distributed data management.

Existing IoT or connected devices platform technologies (such as Cisco Jasper) allow registration of valid smart things, perform connectivity and healthcheck of heart-beats periodically, provide real-time messaging to connect smart things and also data aggregation for domain-specific applications (e.g. tracking driver's event history for automobile insurance). However, due to the diversity of hardware and software implementation, developers often face the challenges of scalability, interoperability and ease of adoption. 

This project is intended to create a low fiction platform framework to connect smart things and devices loosely using a mix of REST API, socket and/or messaging. 


# Features
This IoT platform framework project supports data management and messaging of smart things and devices via:
* Device discovery - registrate valid devices and check heart-beats for connectivity
* Data services REST APIs - read/write events and telemetry data to MongoDB 
* WebSockets server - data streaming of telemetry data
* RabbitMQ gateway - guaranteed messaging for data exchange between smart things or devices
* REST API documentation generator and API console for testing

# Folder structure
* Platform backend under /app/scripts contains all backend REST APIs
  - platformAPI.js: core administration REST API definitions 
  - messageQueueAPI.js: RabbitMQ client to write to the RabbitMQ exchange
  - socketConsole.js: WebSocket server
  - webSocketAPI.js: WebSocket client
  - helper.js: helper class, e.g. simulation function to generate position data points

* Admin console is an AngularJS application
  - /app/controllers:  AngularJS controller for the dashboard
  - /app/directives: Angular-d3 directive used for charts and graphs in the admin console
  - /app/factories: wrapper for REST API
  - /app/models: data schema for telemetry
  - /app/styles: CSS stylesheets for the admin console
  - /app/views: UI views used in the admin console
  - /dist: consolidated JS/CSS used for admin console Web pages

* Configuration file under /config
   - system settings (e.g. server end-points) and credentials (e.g. username, password)

* Documentation under /docs

* Assets under /images

* SSL keys under /keys if HTTPS is used

* Server logs under /log


# Security
* Always use HTTPS: You can turn on/off different modules (e.g. http) by setting the flag to False in config/systemSettings.js. It is perfectly acceptable to use http for early development and testing, but not for staging/production.
* Credentials: Always change your username and password in the config/systemSettings.js.
* Access token: We plan to use JSON Web Token for both REST API and webSockets.

# How to Install IoT Platform
## Pre-requisites
* You need to install NodeJS on your target host (e.g. laptop, Linux host) first.

You can refer to the installation instructions under https://nodejs.org/en/download or https://nodejs.org/en/download/package-manager.

* You need "git" binaries installed on your target host. 
  - Git is pre-installed on MacOS.
  - On Linux host, you can install Git by "sudo yum install git" (for CentOS, Redhat, Fedora), or "sudo apt-get install git" (for Ubuntu).
  - For example, you can install NodeJS on Windows by downloading the binaries from http://nodejs.org/#download.
  - You can install NodeJS and npm on Linux by:
```
curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
sudo yum -y install nodejs
```

* You need to create a local copy of this project. For example,
```
git clone https://github.com/rayymlai/iot-platform.git
``` 

## Dependencies
* AngularJS
* NodeJS

Once you download the iot-platform project, you need to run buildme.sh in the example folder to install required module. Refer to the "How to Run the Demo" section for details. 	

## How to Run the Demo
* After creating a local copy of this project, run the script "buildme.sh" to install NodeJS dependencies and libraries:

```
cd iot-platform
./buildme.sh
```

If you use Windows machine, you can run the following commands as an alternative:
```
cd iot-platform
npm install
mkdir -p log
```

* Go to the example folder and run server.js to start the HTTP Web server: 
```
node server.js
```

You can also use:
```
nodemon server.js
```

The utility "nodemon" is similar to "node" (HTTP Web server), and it will automatically reload the Web pages whenever any Web page is updated.

* Open a Web browser with the URL http://localhost:3000. You should see a Web page with an administration user interface.

## Verify installation
* Open your web browser, and enter http://your-host-name:port/iamAlive
e.g. http://localhost:3000/iamAlive

This should tell you iot-platform is alive.

* If you need to set up SSL, you may want to create your own SSL keys. An example has been created for you under the folder /keys.
  - You can also create a self-signed certificate and SSL keys by running the command "buildssl.sh", which will output the SSL keys under the folder /keys.

* Compile REST API documentation, e.g.
```
./buildapidoc.sh
```

  - This assumes that you have the NPM package "apidoc" installed with root privilege.  You may need to run "buildme.sh" with root privilege if you run into issues of root privilege permission issue.
  - You can access and browse your REST API documentation under the URI /api, e.g. http://localhost:3000/api.

## Discovering Quindar platform REST API
* Open your web browser, and enter http://your-host-name:port/api to list the REST APIs available
e.g. http://platform.audacy.space:7902/api
* There are 3 groups of REST API
  * Read telemetry data, e.g. GET /services/v1/attitude
  * Write telemetry data, e.g. POST /services/v1/position
  * Telemetry simulator (write to MessageQueue), e.g. POST /services/v1/simulation/vehicle/audacy.telemetry.vehicle

## Simulator admin console
The admin console allows users to generate test data for telemetry simulation.
To start the admin console, enter the URL http://your-host-name:port, e.g. http://dockerhost.ourhome.com:4001

# Smoke test
You can run a smoke test by running "smoketest01.sh", e.g.
```
cd test
./smoketest01.sh
```

The smoke test will run a quick automated test of each REST API.  It can quickly tell you if the API server is available, or if any REST API fails to operate.  It will output 2 files:
* automatedTest-log-YYYY-MM-DD.log - a list of tests with successful results.
* automatedTest-err-YYYY-MM-DD.log - a list of tests that failed.

# Additional Information
* For license (terms of use), please refer to the file license.md.
* For developers who want to modify or extend the framework, they may start with development guidelines (e.g. coding style, testing checklist) document in the contributing.md, and also additional checklists under the /docs folder. 
* The document features.md outlines the technical features and a list of widgets.
* The document frameworkDesign.md provides a high level summary of the software architecture.

