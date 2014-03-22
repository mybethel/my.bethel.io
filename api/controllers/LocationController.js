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
