#!/bin/sh

# Install all required node modules.
sudo npm install

# Setup local configuration template.
cp ./config/local.config ./config/local.js

# Start the Sails server.
sails lift
