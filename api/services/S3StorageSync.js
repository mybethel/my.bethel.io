var AWS = require('aws-sdk'),
    S = require('string');

exports.sync = function(options) {

  if (!sails.config.aws.accessKeyId || !sails.config.aws.secretAccessKey)
    return sails.log.error('Required AWS credentials not set.');

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
          if (!data)
            return sails.log.warn('No objects returned from S3 for podcast ' + podcast.id);

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
    var s3media = S(item['ETag']).replaceAll('"', '').s,
        mediaName = item['Key'].split('/').pop();

    PodcastMedia.findOrCreate({
      uuid: s3media
    }, {
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

    storageUsed += item['Size'];
  });

  return storageUsed;
}
