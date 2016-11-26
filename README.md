# my.bethel.io [![Build Status](https://travis-ci.org/mybethel/my.bethel.io.svg?branch=master)](https://travis-ci.org/mybethel/my.bethel.io) [![Codacy Badge](https://www.codacy.com/project/badge/4eda6d93dbc848cdb24bb975c02cad58)](https://www.codacy.com/public/Ignigena/mybethelio)

This repository contains code which powers the Bethel platform at my.bethel.io

Currently in private beta.  Always open source.

Built in Node and powered by Sails.

#### Technical Requirements ####

* Node 6.x
* MongoDB

### Getting Started ###

1. Run `npm install` to get the NPM dependencies.
2. Download and install the Java Runtime Environment (JRE) and the Java
   Development Kit (JDK) in order to run end-to-end tests through Selenium.
3. Run `./scripts/setup` to create a local configuration file. You will need to
   be logged in via the Heroku Toolbelt with appropriate access to production.
4. Create a new MongoDB instance locally using Docker and Kitematic.
5. Edit `config/local.js` to edit the port number of Mongo (if necessary.)

If you have access to the production database, you can pull data straight from
the production server by running `./scripts/copydb --local`.
