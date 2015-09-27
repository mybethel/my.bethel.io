/**
 * MobileController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  tvos: function(req, res) {
    Ministry.find().exec(function (err, results) {
      res.view({
        layout: 'none',
        ministries: results
      });
    });
  },

  channel: function(req, res) {
    var query = {
      name: {
        contains: req.query.search
      }
    };

    Ministry.find(query).exec(function (err, results) {
      res.view('mobile/partials/results', {
        layout: 'none',
        ministries: results
      });
    });
  }

};
