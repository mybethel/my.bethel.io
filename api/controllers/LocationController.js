/**
 * LocationController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var ObjectID = require('mongodb').ObjectID;

module.exports = {

  list: function (req, res) {
    Location.find({ministry: new ObjectID(req.session.Ministry.id)}).sort('name asc').exec(function foundLocations(err, locations) {
      if (err) res.send(err, 500);

      res.view({
        locations: locations
      });
    });
  },

  new: function(req, res) {
    res.view({
      layout: req.viewData.layout
    });
  },

  edit: function (req, res) {
    Location.findOne(req.param('id'), function foundLocation(err, location) {
      if (err) res.send(err, 500);
    
      res.view({
        location: location,
        layout: req.viewData.layout
      });
    });
  },

  update: function(req, res) {
    Location.update(req.param('id'), req.params.all(), function locationUpdated(err) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/location/edit/' + req.param('id'));
      }
      req.session.flash = {};

      Location.publishUpdate(req.param('id'), req.params.all());

      return res.redirect('/#/dashboard/locations');
    });
  },

  all: function(req, res) {
    Location.find(function foundLocations(err, locations) {
      if (err) res.send(err, 500);

      res.send(locations, 200);
    });
  },

  ministry: function(req, res) {
    var findById = req.param('id');

    if (!findById && req.session.Ministry) {
      findById = new ObjectID(req.session.Ministry.id);
    }

    Location.find({ministry: findById}, function foundLocations(err, locations) {
      if (err) res.send(err, 500);

      Location.watch(req.socket);

      res.send(locations, 200);
    })
  },

  map: function(req, res) {
    var lat = parseFloat(req.param('lng')),
        lng = parseFloat(req.param('lat')),
        rad = parseFloat(req.param('radius'));

    if (!lat || !lng || !rad) {
      return res.send(404);
    }

    Location.native(function (err, collection) {
      sails.log.info('Searching '+lat+','+lng+' with radius of '+rad+' kilometers.');

      collection.geoNear(lat, lng, {
        maxDistance: rad / 6371,
        distanceMultiplier: 6371,
        spherical: true
      }, function (mongoErr, docs) {
        if (mongoErr) return res.send(mongoErr, 500);
        var ministries = [];

        _.each(docs.results, function(location) {
          ministries.push({_id: location.obj.ministry});
        });

        if (!ministries.length)
          return res.send({locations: docs.results}, 200);

        Ministry.find({
          or: ministries
        }).done(function(err, foundMinistries) {
          ministries = {};
          _.each(foundMinistries, function(ministry) {
            ministries[ministry.id] = ministry;
          })
          res.send({locations: docs.results, ministries: ministries}, 200);
        });
      });
    });
  },

  show: function (req, res) {
    Location.findOne(req.param('id'), function foundLocation(err, location) {
      if (err) res.send(err, 500);
      if (!location) res.send(404);
    
      res.send(200, location);
    });
  }
	
};
