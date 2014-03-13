var AWS = require('aws-sdk'),
    S = require('string');

exports.sync = function(options) {

  AWS.config.update(sails.config.aws);
  var s3 = new AWS.S3();

  sails.log.info('Syncing S3 storage.');

  // Limit only to podcasts with Bethel Cloud Storage selected
  Podcast.find({source: 1}, function foundPodcasts(err, podcasts) {
    if (err) return next(err);

    podcasts.forEach(function(podcast) {

      Ministry.findOne(podcast.ministry, function foundMinistry(err, ministry) {
        if (err) return next(err);

        var ministryId, podcastId;

        // Support for legacy model storage
        if (ministry.legacyId) {
          ministryId = ministry.legacyId;
        } else {
          ministryId = ministry.id;
        }

        if (podcast.legacyId) {
          podcastId = podcast.legacyId;
        } else {
          podcastId = podcast.id;
        }

        // Get a list of files from the S3 bucket
        s3.listObjects({Bucket: 'cloud.bethel.io', Prefix: ministryId + '/' + podcastId + '/'}, function(err, data) {
          var storageUsed = 0;
          data['Contents'].shift();
          sails.log('Syncing ' + data['Contents'].length + ' items in ' + ministryId + '/' + podcastId);

          data['Contents'].forEach(function(item) {
              var s3media = S(item['ETag']).replaceAll('"', '').s;

              PodcastMedia.native(function(err, collection) {
                collection.update(
                  {
                    uuid: s3media,
                    podcast: podcast.id
                  },
                  {
                    $set: {
                      url: 'http://cloud.bethel.io/' + item['Key'],
                      size: item['Size'],
                      uuid: s3media,
                      podcast: podcast.id,
                      type: 'cloud'
                    },
                    $setOnInsert: {
                      date: item['LastModified']
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

              storageUsed += item['Size'];
          });

          Podcast.update(podcast.id, {storage: storageUsed}, function podcastUpdated(err) {
            if (err) console.log(err);
          });

          sails.log(storageUsed + ' storage used.');
          sails.log.info('Finished S3 sync.');
        });

      });
    });
  });
};
