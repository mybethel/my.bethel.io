var restify = require('restify');

exports.sync = function(options) {

  console.log('-----> Syncing Vimeo storage.');

  Podcast.find({source: 2}, function foundPodcasts(err, podcasts) {
    if (err) return next(err);

    var client = restify.createJsonClient({
      url: 'https://vimeo.com',
      version: '*'
    });

    podcasts.forEach(function(podcast) {
      if (!podcast.sourceKey || !podcast.sourceMeta) return;

      var page = 1;
      do {              
        client.get('/api/v2/' + podcast.sourceKey + '/videos.json?page=' + page, function(err, req, res, obj) {
          obj.forEach(function(video) {
            video.tags.split(', ').forEach(function(tag) {
              if (podcast.sourceMeta.indexOf(tag.toLowerCase()) >= 0) {

                PodcastMedia.native(function(err, collection) {
                  collection.update(
                    {
                      uuid: video.id,
                      podcast: podcast.id
                    },
                    {
                      $set: {
                        title: video.title,
                        date: new Date(video.upload_date),
                        description: video.description,
                        tags: video.tags.split(', '),
                        duration: video.duration,
                        thumbnail: video.thumbnail_small,
                        uuid: video.id,
                        podcast: podcast.id
                      }
                    }, 
                    {
                      upsert:true,
                      safe:true
                    },
                    function(err){
                      if (err) return next(err);
                    }
                  );
                });

              }
            });
          });
        });
        page++;
      } while (page <= 3);
    });
  });

};
