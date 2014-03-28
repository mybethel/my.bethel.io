/**
 * LocationController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  list: function (req, res) {
    Location.find({ministry: req.session.Ministry.id}, function foundLocations(err, locations) {
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

  create: function (req, res) {
    Location.create(req.params.all(), function locationCreated(err, location) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/location/new');
      }
      req.session.flash = {};

      return res.redirect('/locations');
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

      return res.redirect('/locations');
    });
  },

  delete: function(req, res) {
    Location.findOne(req.param('id'), function foundLocation(err, location) {
      if (err) res.send(err, 500);

      res.view({
        location: location,
        layout: req.viewData.layout
      });
    });
  },

  destroy: function(req, res) {
    Location.destroy(req.param('id'), function deletedLocation(err, location) {
      if (err) return next(err);

      res.redirect('/locations');
    });
  },

  ministry: function(req, res) {
    var findById = req.param('id');

    if (!findById && req.session.Ministry.id) {
      findById = req.session.Ministry.id;
    }

    Location.find({ministry: findById}, function foundLocations(err, locations) {
      if (err) res.send(err, 500);

      res.send(locations, 200);
    })
  },

  show: function (req, res) {
    Location.findOne(req.param('id'), function foundLocation(err, location) {
      if (err) res.send(err, 500);
      if (!location) res.send(404);
    
      res.send(200, location);
    });
  }
	
};
