const AWS = require('aws-sdk');
AWS.config.update(sails.config.aws);
const lambda = new AWS.Lambda({ region: 'us-east-1' });

var vimeo = {};

vimeo.sync = function() {
  if (!Podcast) {
    sails.log.error('Sails failed to bootstrap: Podcast undefined.');
    sails.log.error(sails.config.connections);
    resolve();
  }

  var start = new Date().getTime();
  sails.log.info('Syncing Vimeo storage...');

  return new Promise(resolve => {
    Podcast.find({ source: 2, deleted: { '!': true } }).populate('service')
      .then(podcasts => {
        podcasts = podcasts.map(podcast => vimeo.queryApi(podcast));

        Promise.all(podcasts).then(() => {
          var end = new Date().getTime();
          sails.log.info(`Vimeo sync completed in ${(end - start)} ms.`);
          resolve();
        }).catch(sails.log.error);
      }).catch(err => {
        sails.log.error(err);
        resolve();
      });
  });
};

vimeo.syncOne = function(podcastId) {
  return new Promise(function(resolve) {
    Podcast.findOne(podcastId).populate('service')
      .then(podcast => {
        if (!podcast) {
          sails.log.error(`${podcastId}: Podcast not found.`);
          return resolve();
        }

        if (!podcast.service || !podcast.sourceMeta) {
          sails.log.error(`${podcast.id}: Vimeo account or tags not defined.`);
          return resolve();
        }

        vimeo.queryApi(podcast).then(resolve).catch(sails.log.error);
      })
      .catch(err => {
        sails.log.error(err);
        resolve();
      });
  });
};

vimeo.queryApi = function(podcast) {
  return new Promise(function(resolve) {
    lambda.invoke({
      FunctionName: 'vimeoSync',
      Payload: JSON.stringify({
        auth: sails.config.services.vimeo,
        tags: podcast.sourceMeta && podcast.sourceMeta.toString(),
        token: podcast.service.accessToken
      })
    }, function(err, data) {
      if (err) {
        sails.log.error(err);
        return resolve();
      }

      let videosToProcess = JSON.parse(data.Payload);
      let count = videosToProcess.length || 0;
      sails.log.info(`${podcast.id}: ${count} matching videos.`);

      if (!videosToProcess || count < 1) {
        if (data.Payload.errorMessage)
          sails.log.error(data.Payload.errorMessage);
        vimeo.finishSync(podcast.id);
        return resolve();
      }

      videosToProcess.map(video => vimeo.podcastMediaUpsert(video, podcast));
      Promise.all(videosToProcess).then(function() {
        vimeo.finishSync(podcast.id);
        resolve();
      });
    });
  });
};

vimeo.podcastMediaUpsert = function(video, podcast) {
  return new Promise(function(resolve) {
    if (!video) return resolve();

    var videoId = video.uri.toString().replace('/videos/', '');

    if (!videoId) return resolve();

    var videoTags = [];
    if (video.tags) {
      video.tags.forEach(function(tag) {
        videoTags.push(tag.name);
      });
    }

    var videoThumbnail = '',
        thumbSize = 0;

    if (video.pictures && video.pictures.sizes) {
      video.pictures.sizes.forEach(function(picture) {
        if (picture.width > thumbSize) {
          thumbSize = picture.width;
          videoThumbnail = picture.link;
        }
      });
    }

    var videoVariants = {};

    var videoUrl = '';
    if (video.files) {
      video.files.forEach(function(file) {
        videoVariants[file.quality] = file.link_secure;

        if (file.quality === 'sd')
          videoUrl = file.link_secure;
      });
    }

    var payload = {
      name: video.name,
      description: video.description,
      tags: videoTags,
      duration: video.duration,
      thumbnail: videoThumbnail,
      url: videoUrl,
      variants: videoVariants,
      deleted: false
    };

    // First we attempt to update a record with the latest data if it exists.
    PodcastMedia.update({ uuid: videoId, podcast: podcast.id }, payload, function podcastMediaUpdate(err, media) {
      // If no error and a media object is returned, the media already exists.
      if (!err && media && media[0]) {
        PodcastMedia.publishUpdate(media[0].id, payload);
        return resolve();
      }

      // Otherwise, we need to create a new one. A few additional attributes are
      // added here to ensure that subsequent update calls find this media.
      payload.date = new Date(video.created_time);
      payload.uuid = videoId;
      payload.podcast = podcast.id;

      PodcastMedia.create(payload, function podcastMediaCreated(err, media) {
        if (err) sails.log.error(err);

        PodcastMedia.publishCreate(media);
        resolve();
      });
    });
  });
};

vimeo.finishSync = function(podcastId) {
  // Update the last sync date on the podcast and inform all listening sockets.
  return Podcast.update(podcastId, { lastSync: new Date() }).then(updatedPodcast => {
    return Podcast.publishUpdate(updatedPodcast[0].id, { lastSync: updatedPodcast[0].lastSync });
  }).catch(sails.log.error);
};

module.exports = vimeo;
