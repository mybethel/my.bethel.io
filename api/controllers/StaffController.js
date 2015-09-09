/**
 * StaffController
 *
 * @description :: Server-side logic for managing staff
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var HeapdumpOffworld = require('offworld-heapdumper'),
    S3Destination = HeapdumpOffworld.Destinations.S3;

module.exports = {

  debug: function(req, res) {
    var destination = new S3Destination({
      accessKeyId: sails.config.aws.accessKeyId,
      secretAccessKey: sails.config.aws.secretAccessKey,
      bucket: 'bethel.debug'
    });
    var heapdumper = new HeapdumpOffworld(destination);

    heapdumper.writeSnapshot(function(err, details) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      res.ok('Heap dump created at: ' + details['Location'])
    });
  }

};
