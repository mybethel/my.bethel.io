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

        // Get a list of files from the S3 bucket
        s3.listObjects({Bucket: 'cloud.bethel.io', Prefix: 'podcast/' + ministry.id + '/' + podcast.id + '/'}, function(err, data) {
          data['Contents'].shift();
          sails.log('Syncing ' + data['Contents'].length + ' items in podcast/' + ministry.id + '/' + podcast.id);

          var storageUsed = processFoundMedia(data['Contents'], podcast.id);

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

function processFoundMedia(media, podcastId) {
  var storageUsed = 0;

  media.forEach(function(item) {
    var s3media = S(item['ETag']).replaceAll('"', '').s;

    PodcastMedia.findOne({uuid: s3media}, function foundPodcastMedia(err, media) {
      if (err) sails.log.error(err);

      if (!media) {
        var mediaName = item['Key'].split('/');
        mediaName = mediaName[mediaName.length-1];

        PodcastMedia.create({
          name: mediaName,
          date: item['LastModified'],
          url: 'http://cloud.bethel.io/' + encodeURI(item['Key']),
          size: item['Size'],
          uuid: s3media,
          podcast: podcastId,
          type: 'cloud'
        }, function podcastMediaCreated(err, media) {
          if (err) sails.log.error(err);
        });
      }
    });

    storageUsed += item['Size'];
  });

  return storageUsed;
}
