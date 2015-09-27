/**
 * MobileController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  manage: function (req, res) {
    res.view();
  },

  tvos: function(req, res) {
    Ministry.find().exec(function (err, results) {
      res.view({
        layout: 'none',
        ministries: results
      });
    });
  }

};
