var request = require('request'),
    ObjectID = require('mongodb').ObjectID;

exports.sync = function(options) {

  sails.log.info('Syncing Vimeo storage.');

  Podcast.find({source: 2}, function foundPodcasts(err, podcasts) {
    if (err) return next(err);

    podcasts.forEach(function(podcast) {
      if (!podcast.sourceKey || !podcast.sourceMeta) {
        sails.log('Vimeo username or tags not defined for podcast ' + podcast.id + '.');
        return;
      }

      var page = 1;
      do {
        request('https://vimeo.com/api/v2/' + podcast.sourceKey + '/videos.json?page=' + page, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body);
            if (obj) {
              obj.forEach(function(video) {
                if (video.tags) {
                  video.tags.split(', ').forEach(function(tag) {
                    if (podcast.sourceMeta.toLowerCase().indexOf(tag.toLowerCase()) >= 0) {
                      podcastMediaUpsert(video, podcast);
                    }
                  });
                }
              });
            }
          }
        });
        page++;
      } while (page <= 3);
    });
  });

};

function podcastMediaUpsert(video, podcast) {
  PodcastMedia.findOne({uuid: video.id.toString(), podcast: new ObjectID(podcast.id)}, function foundPodcastMedia(err, media) {
    if (err) sails.log.error(err);

    if (!media) {
      PodcastMedia.create({
        name: video.title,
        date: new Date(video.upload_date),
        description: video.description,
        tags: video.tags.split(', '),
        duration: video.duration,
        thumbnail: video.thumbnail_small,
        uuid: video.id,
        podcast: new ObjectID(podcast.id)
      }, function podcastMediaCreated(err, media) {
        if (err) sails.log.error(err);
      });
    }
  });
}
