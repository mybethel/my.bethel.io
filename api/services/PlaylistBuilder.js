var moment = require('moment'),
    Promise = require('bluebird');

exports.find = function(ministryId) {
  return new Promise(function(resolve, reject) {
    Playlist.findOne({ ministry: ministryId, name: 'Sermon Series' }).exec(function(err, playlist) {
      if (err || !playlist) return reject();
      resolve(playlist.id);
    });
  });
}

exports.from = function(parentPlaylist) {

  var start = Date.now();

  return new Promise(function(resolve, reject) {

    Playlist.findOne(parentPlaylist).exec(function(err, playlist) {
      if (err || !playlist) return reject();

      Playlist.find({ parent: parentPlaylist }).sort('dateStart desc').exec(function(err, children) {
        var relatedMedia = { podcast: [playlist.podcastAudio, playlist.podcastVideo] };
        PodcastMedia.find(relatedMedia).sort('date desc').exec(function(err, media) {

          // Associate each media with a parent playlist within the date range.
          _.each(media, function(item, itemIndex) {
            if (!item) return;
            media[itemIndex].type = PodcastHelper.mimeTypeFromUrl(item.url).split('/').shift();

            // Group audio and video media from the same date.
            if (media[itemIndex + 1] && moment(item.date).isBetween(moment(media[itemIndex + 1].date).subtract(1, 'days').startOf('day'), moment(media[itemIndex + 1].date).add(1, 'days').endOf('day'))) {
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
              if (moment(item.date).isBetween(moment(parent.dateStart).startOf('day'), moment(parent.dateEnd).endOf('day'))) {
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

          resolve({
            playlist: playlist,
            media: children,
            debug: Date.now() - start
          });
        });
      });
    });
  });

};
