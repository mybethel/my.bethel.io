const moment = require('moment');
const Promise = require('bluebird');
const Vimeo = require('vimeo').Vimeo;

var vimeo = {};

vimeo.refreshAll = false;

/**
 * Generate a new API client with a user's access token.
 * @see https://github.com/vimeo/vimeo.js
 * @param {string} token User access token.
 * @return {Object} Vimeo API client.
 */
vimeo.api = function(token) {
  return new Vimeo(sails.config.services.vimeo.key, sails.config.services.vimeo.secret, token);
};

/**
 * Get videos for a user from the Vimeo API.
 * @param {Object} service Service object for podcast.
 * @param {string} service.accessToken Vimeo access token to authorize.
 * @param {string} service.user Vimeo username to query videos for.
 * @param {Number} page The page number requested.
 * @param {Object} headers Additional headers for the request.
 * @param {Function} cb Callback when request is finished.
 */
vimeo.getVideos = function(service, page, headers, cb) {
  headers = headers || {};
  page = page || 1;
  vimeo.api(service.accessToken).request({
    headers,
    method: 'GET',
    path: `${service.user}/videos`,
    query: { page, per_page: 50 }
  }, cb);
};

vimeo.sync = function(refreshAll) {

  vimeo.refreshAll = refreshAll || false;

  if (!Podcast) {
    sails.log.error('Sails failed to bootstrap: Podcast undefined.');
    sails.log.error(sails.config.connections);
    resolve();
  }

  return new Promise(resolve => {

    var start = new Date().getTime();
    sails.log.info('Syncing Vimeo storage...');

    Podcast.find({ source: 2, deleted: { $ne: true } }).populate('service')
      .then(podcasts => {
        podcasts = podcasts.map(podcast => vimeo.queryApi(podcast));

        Promise.all(podcasts).then(() => {
          var end = new Date().getTime();
          sails.log.info(`Vimeo sync completed in ${(end - start)} ms.`);
          resolve();
        });
      })
      .catch(err => {
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

        vimeo.queryApi(podcast).then(resolve);
      })
      .catch(err => {
        sails.log.error(err);
        resolve();
      });
  });
};

vimeo.queryApi = function(podcast) {
  return new Promise(function(resolve) {
    sails.log.info(podcast.id + ': Querying Vimeo API.');

    var headers = {};
    if (!vimeo.refreshAll) {
      headers['If-Modified-Since'] = moment().subtract(6, 'minutes').toString();
    }

    vimeo.getVideos(podcast.service, 1, headers, (error, body, statusCode) => {
      if (error || (statusCode === 304 && !vimeo.refreshAll) || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error('Vimeo API returned status code ' + statusCode + ' for podcast ' + podcast.id + '.');
        return resolve();
      }

      var totalPages = 0;
      if (body.total > body.page * body.per_page) {
        totalPages = Math.ceil((body.total - (body.page * body.per_page)) / body.per_page) + 1;
      }

      sails.log.info(podcast.id + ': Found ' + totalPages + ' total pages of videos.');

      var processApiResults = [];
      processApiResults.push(vimeo.processPage(body, podcast));
      for (var i = 1; i <= totalPages; i++) {
        processApiResults.push(vimeo.getResultsPage(podcast, i, headers));
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

vimeo.getResultsPage = function(podcast, page, headers) {
  return new Promise(function(resolve) {
    vimeo.getVideos(podcast.service, page, headers, (error, body, statusCode) => {
      if (error || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error(podcast.id + ': Vimeo API returned status code ' + statusCode + '.');
        return resolve();
      }

      vimeo.processPage(body, podcast).then(resolve);
    });
  });
};

/**
 * Process a single page of Vimeo results. Each video is checked and either
 * included in the pending sync or removed entirely.
 * @param {Object} results Page of results from the Vimeo API.
 * @param {Object} podcast The podcast which is being sync'd.
 * @return {Promise} Fulfilled when all relevant episodes have been sync'd.
 */
vimeo.processPage = function(results, podcast) {
  var videosToProcess = results.data.filter(video => vimeo.processEntry(video, podcast.sourceMeta));
  sails.log.info(podcast.id + ': Page ' + results.page + ' - found ' + videosToProcess.length + ' matching videos.');

  videosToProcess.map(video => vimeo.podcastMediaUpsert(video, podcast));
  return new Promise(resolve => Promise.all(videosToProcess).then(resolve));
};

/**
 * Process a single Vimeo video and determine whether or not to sync.
 * @param {Object} video The video as returned by the Vimeo API.
 * @param {Array|String} tagsToSync A single or multiple tags to sync.
 * @return {Bool} Whether the video should be sync'd.
 */
vimeo.processEntry = (video, tagsToSync) => {
  if (!video.tags) return false;

  if (video.privacy && video.privacy.view !== 'anybody') {
    sails.log.verbose(`Ignoring private video ${video.uri}`);
    return false;
  }

  var match = false;
  tagsToSync = tagsToSync.toString().toLowerCase();

  video.tags.map(tag => {
    tag = tag.name.toLowerCase();
    if (tagsToSync.indexOf(tag) !== -1) match = true;
    return tag;
  });

  return match;
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

module.exports = vimeo;
