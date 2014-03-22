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
	
};
