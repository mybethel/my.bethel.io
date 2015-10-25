/**
 * PlaylistController
 *
 * @description :: Server-side logic for managing playlist
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');

module.exports = {

  findOne: function(req, res) {
    var start = Date.now();
    Playlist.findOne(req.param('id')).exec(function(err, playlist) {
      if (err || !playlist) return res.notFound();

      Playlist.find({ parent: req.param('id') }).sort('dateStart desc').exec(function(err, children) {
        var relatedMedia = { podcast: [playlist.podcastAudio, playlist.podcastVideo] };
        PodcastMedia.find(relatedMedia).sort('date desc').exec(function(err, media) {

          // Associate each media with a parent playlist within the date range.
          _.each(media, function(item, itemIndex) {
            if (!item) return;
            var itemDate = item.date.getTime() / 1000;
            media[itemIndex].type = PodcastHelper.mimeTypeFromUrl(item.url).split('/').shift();

            // Group audio and video media from the same date.
            if (media[itemIndex + 1] && moment(item.date).format('MMDDYY') == moment(media[itemIndex + 1].date).format('MMDDYY')) {
              media[itemIndex + 1].type = PodcastHelper.mimeTypeFromUrl(media[itemIndex + 1].url).split('/').shift();
              var mediaGrouping = {};
              mediaGrouping.date = item.date;
              mediaGrouping.name = item.name;
              mediaGrouping[media[itemIndex].type] = media[itemIndex];
              mediaGrouping[media[itemIndex + 1].type] = media[itemIndex + 1];
              media[itemIndex] = mediaGrouping;
              delete(media[itemIndex + 1]);
            }

            _.each(children, function(parent, index) {
              if (itemDate >= parent.dateStart.getTime() / 1000 && itemDate <= parent.dateEnd.getTime() / 1000) {
                if (!children[index].media) children[index].media = [];
                children[index].media.push(media[itemIndex]);
                delete media[itemIndex];
              }
            });
          });

          // Any media leftover is not associated with a playlist.
          _.each(media, function(item, itemIndex) {
            if (item) children.push(item);
          });

          // Order the media and children playlists by their date.
          children.sort(function(a, b) {
            if (a.date < b.date || a.dateStart < b.dateStart || a.date < b.dateStart || a.dateStart < b.date)
              return 1;
            if (a.date > b.date || a.dateStart > b.dateStart || a.date > b.dateStart || a.dateStart > b.date)
              return -1;
            return 0;
          });

          return res.send({
            playlist: playlist,
            media: children,
            debug: Date.now() - start
          });
        });
      });
    });
  }

};
