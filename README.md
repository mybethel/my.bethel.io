# my.bethel.io [![Build Status](https://travis-ci.org/mybethel/my.bethel.io.svg?branch=master)](https://travis-ci.org/mybethel/my.bethel.io) [![Codacy Badge](https://www.codacy.com/project/badge/4eda6d93dbc848cdb24bb975c02cad58)](https://www.codacy.com/public/Ignigena/mybethelio)

This repository contains code which powers the Bethel platform at my.bethel.io

Currently in private beta.  Always open source.

Built in Node and powered by Sails.

#### Technical Requirements ####

* Node
* MongoDB

#### Installation and Setup ####

* Run `./scripts/setup.sh` in the docroot to setup local environment.
* Modify `./config/local.js` if needed to match the local MongoDB configuration.
* The Sails server will be lifted locally at `http://localhost:1337`.
