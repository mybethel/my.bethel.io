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
	
};
