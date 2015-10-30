/**
 * PlaylistController
 *
 * @description :: Server-side logic for managing playlist
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  findOne: function(req, res) {
    PlaylistBuilder.from(req.param('id')).then(function(result) {
      res.send(result);
    }, function() {
      res.notFound();
    });
  }

};
