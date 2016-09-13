#!/bin/bash
echo "Building self-signed SSL certificate for NodeJS with HTTPS"
echo
echo "Step 1 - set up directory ./keys"
if [ -d "keys" ]; then
   cd keys
else 
   mkdir keys
   cd keys
fi
echo "Step 2 - create private key"
openssl genrsa -out iot-key.pem 2048
echo "Step 3 - create CSR certificate signing request"
openssl req -new -key iot-key.pem -out server.csr
echo "Step 4 - sign the CSR"
openssl rsa -in iot-key.pem -out server.key
openssl x509 -req -days 365 -in server.csr -signkey server.key -out iot-cert.pem
