var moment = require('moment'),
    Promise = require('bluebird'),
    Vimeo = require('vimeo-api').Vimeo,
    VimeoAPI = new Vimeo('4990932cb9c798b238e98108b4890c59497297ba');

var vimeo = {};

vimeo.refreshAll = false;

vimeo.sync = function(refreshAll) {

  vimeo.refreshAll = typeof refreshAll !== 'undefined' ? refreshAll : false;

  if (!Podcast) {
    sails.log.error('Sails failed to bootstrap: Podcast undefined.');
    sails.log.error(sails.config.connections);
    resolve();
  }

  return new Promise(function(resolve) {

    var start = new Date().getTime();
    sails.log.info('Syncing Vimeo storage...');

    Podcast.find({ source: 2 }).populate('service').exec(function (err, podcasts) {
      if (err) {
        sails.log.error(err);
        return resolve();
      }

      podcasts = podcasts.map(function(podcast) {
        return vimeo.queryApi(podcast);
      });

      Promise.all(podcasts).then(function() {
        var end = new Date().getTime();
        sails.log.info('Vimeo sync completed in ' + (end - start) + 'ms.');
        resolve();
      });
    });

  });
};

vimeo.fixMissingUrl = function(podcast) {
  // Search for Vimeo podcast media that are missing a URL.
  PodcastMedia.find({ url: '', podcast: podcast.id }, function foundMedia(err, media) {
    if (media.length > 0)
      sails.log.warn(podcast.id + ': Found ' + media.length + ' media with missing URLs.');

    media.forEach(function (video) {
      VimeoAPI.request({
        path: '/videos/' + video.uuid,
        headers:  { 'Authorization': 'Bearer ' + podcast.service.accessToken }
      }, function (error, body, statusCode) {
        if (!body || !body.files) {
          sails.log.error('Vimeo API returned status code ' + statusCode + ' for video ' + video.uuid + '.');
          return;
        }

        body.files.forEach(function(file) {
          if (file.quality === 'sd') {
            PodcastMedia.update(video.id, { url: file.link_secure }, function podcastUpdated(err) {
              if (err)
                return sails.log.error(err);

              sails.log('Updated Vimeo URL to ' + file.link_secure + ' for media: ' + video.id);
            });
          }
        });
      })
    });
  });
}

vimeo.syncOne = function(podcastId) {
  return new Promise(function(resolve) {

    Podcast.findOne(podcastId).populate('service').exec(function (err, podcast) {
      if (!podcast) {
        sails.log.error(podcastId + ': Podcast not found.');
        return resolve();
      }

      if (!podcast.service || !podcast.sourceMeta) {
        sails.log.error(podcast.id + ': Vimeo account or tags not defined.');
        return resolve();
      }

      vimeo.queryApi(podcast).then(resolve);
    });

  });
};

vimeo.queryApi = function(podcast) {
  vimeo.fixMissingUrl(podcast);

  return new Promise(function(resolve) {
    sails.log.info(podcast.id + ': Querying Vimeo API.');
    var queryHeaders = { 'Authorization': 'Bearer ' + podcast.service.accessToken };

    if (!vimeo.refreshAll) {
      queryHeaders['If-Modified-Since'] = moment().subtract(6, 'minutes').toString();
    }

    VimeoAPI.request({
      path: podcast.service.user + '/videos?per_page=50',
      headers: queryHeaders
    }, function (error, body, statusCode) {
      if (error || (statusCode === 304 && !vimeo.refreshAll) || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error('Vimeo API returned status code ' + statusCode + ' for podcast ' + podcast.id + '.');
        return resolve();
      }

      var totalPages = 0;
      if (body.total > body.page * body.per_page) {
        totalPages = Math.ceil((body.total - (body.page * body.per_page)) / body.per_page);
      }

      sails.log.info(podcast.id + ': Found ' + totalPages + ' total pages of videos.');

      var processApiResults = [];
      processApiResults.push(vimeo.processPage(body, podcast));
      for (var i = 1; i < totalPages; i++) {
        processApiResults.push(vimeo.getResultsPage(podcast.service.user, podcast, i, queryHeaders));
      }

      Promise.all(processApiResults).then(function() {

        // Update the last sync date on the podcast and inform all listening sockets.
        Podcast.update(podcast.id, { lastSync: new Date() }).exec(function(err, updatedPodcast) {
          if (err) return sails.log.error(err);
          Podcast.publishUpdate(updatedPodcast[0].id, { lastSync: updatedPodcast[0].lastSync });

          resolve();
        });

      });
    });

  });
};

vimeo.getResultsPage = function(user, podcast, page, headers) {
  return new Promise(function(resolve) {
    VimeoAPI.request({
      path: user + '/videos?per_page=50&page=' + page,
      headers: headers
    }, function (error, body, statusCode) {
      if (error || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error(podcast.id + ': Vimeo API returned status code ' + statusCode + '.');
        return resolve();
      }

      vimeo.processPage(body, podcast).then(resolve);
    });
  });
};

vimeo.processPage = function(results, podcast) {
  return new Promise(function(resolve) {
    var videosToProcess = [];

    results.data.forEach(function(video) {
      if (!video.tags) return;

      if (video.privacy && video.privacy.view !== 'anybody') {
        sails.log.warn('Ignoring private video ' + video.uri);
        return;
      }

      video.tags.forEach(function(tag) {
        if (podcast.sourceMeta.toString().toLowerCase().indexOf(tag.name.toLowerCase()) === -1)
          return;

        videosToProcess.push(vimeo.podcastMediaUpsert(video, podcast));
      });
    });

    sails.log.info(podcast.id + ': Page ' + results.page + ' - found ' + videosToProcess.length + ' matching videos.');
    Promise.all(videosToProcess).then(resolve);
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

    var videoThumbnail = '', thumbSize = 0;
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
      variants: videoVariants
    };

    // First we attempt to update a record with the latest data if it exists.
    PodcastMedia.update({ uuid: videoId, podcast: podcast.id }, payload, function podcastMediaUpdate(err, media) {

      // If no error and a media object is returned, the media already exists.
      if (!err && media) {
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

module.exports = vimeo;
