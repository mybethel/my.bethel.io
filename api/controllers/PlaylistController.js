/**
 * PlaylistController
 *
 * @description :: Server-side logic for managing playlist
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  findOne: function(req, res) {
    Playlist.findOne(req.param('id')).exec(function(err, playlist) {
      if (err || !playlist) return res.notFound();

      return res.ok();

      /*PlaylistBuilder.from(playlist).then(function(playlist) {
        return res.ok(playlist);
      });*/
    });
  }

};
