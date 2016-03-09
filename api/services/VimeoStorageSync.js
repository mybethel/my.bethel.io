const moment = require('moment');
const PromisePool = require('es6-promise-pool');
const Vimeo = require('vimeo-api').Vimeo;

function VimeoSync(refreshAll, podcastId) {
  this.api = new Vimeo(sails.config.vimeo.apiKey);
  this.refreshAll = refreshAll || false;

  if (!Podcast) {
    sails.log.error('Sails failed to bootstrap: Podcast undefined.');
    sails.log.error(sails.config.connections);
    return;
  }

  this.debug = {
    start: new Date().getTime(),
    end: 0
  };

  sails.log.info('Syncing Vimeo storage...');
  return new Promise(resolve => podcastId ? this.syncOne(podcastId) : this.sync(resolve));
}

VimeoSync.prototype.sync = function(resolve) {
  Podcast.find({ source: 2 }).populate('service').exec((err, podcasts) => {
    if (err) {
      sails.log.error(err);
      return resolve();
    }

    podcasts = podcasts.map(podcast => this.queryApi(podcast));

    Promise.all(podcasts).then(() => {
      this.debug.end = new Date().getTime();
      sails.log.info(`Vimeo sync completed in ${this.debug.end - this.debug.start} ms.`);
      resolve();
    });
  });
};

VimeoSync.prototype.updateUrl = function(videoId, newUrl) {
  PodcastMedia.update(videoId, { url: newUrl }, err => {
    if (err) return sails.log.error(err);
    sails.log('Updated Vimeo URL to ' + file.link_secure + ' for media: ' + video.id);
  });
};

// Search for Vimeo podcast media that are missing a URL.
VimeoSync.prototype.fixMissingUrl = function(podcast) {
  PodcastMedia.find({ url: '', podcast: podcast.id }, err, media => {
    if (err || media.length < 1) return;

    sails.log.warn(`${podcast.id}: Found ${media.length} media with missing URLs.`);

    media.forEach(video => {
      this.api.request({
        path: `/videos/${video.uuid}`,
        headers: { Authorization: `Bearer ${podcast.service.accessToken}` }
      }, (error, body, statusCode) => {
        if (!body || !body.files) {
          sails.log.error(`Vimeo API returned status code ${statusCode} for video ${video.uuid}.`);
          return;
        }

        body.files.forEach(file => {
          if (file.quality === 'sd') {
            this.updateUrl(video.id, file.link_secure);
          }
        });
      });
    });
  });
};

VimeoSync.prototype.syncOne = function(resolve) {
  Podcast.findOne(podcastId).populate('service').exec((err, podcast) => {
    if (err || !podcast) {
      sails.log.error(`${podcastId}: Podcast not found.`);
      return resolve();
    }

    if (!podcast.service || !podcast.sourceMeta) {
      sails.log.error(`${podcast.id}: Vimeo account or tags not defined.`);
      return resolve();
    }

    this.queryApi(podcast).then(resolve);
  });
};

VimeoSync.prototype.queryApi = function(podcast) {
  this.fixMissingUrl(podcast);

  return new Promise(resolve => {
    sails.log.info(`${podcast.id}: Querying Vimeo API.`);
    var queryHeaders = { Authorization: `Bearer ${podcast.service.accessToken}` };

    if (!this.refreshAll) {
      queryHeaders['If-Modified-Since'] = moment().subtract(6, 'minutes').toString();
    }

    this.api.request({
      path: podcast.service.user + '/videos?per_page=50',
      headers: queryHeaders
    }, (error, body, statusCode) => {
      if (error || (statusCode === 304 && !this.refreshAll) || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error(`Vimeo API returned status code ${statusCode} for podcast ${podcast.id}.`);
        return resolve();
      }

      var totalPages = 0;
      if (body.total > body.page * body.per_page) {
        totalPages = Math.ceil((body.total - (body.page * body.per_page)) / body.per_page);
      }

      if (totalPages < 1) return resolve();
      sails.log.info(`${podcast.id}: Found ${totalPages} total pages of videos.`);

      var page = 1;
      new PromisePool(() => {
        page++;
        return (page < totalPages) ? this.getResultsPage(podcast.service.user, podcast, page, queryHeaders) : null;
      }, 30).start().then(() => {

        // Update the last sync date on the podcast and inform all listening sockets.
        Podcast.update(podcast.id, { lastSync: new Date() }).exec((err, updatedPodcast) => {
          if (err) return sails.log.error(err);
          Podcast.publishUpdate(updatedPodcast[0].id, { lastSync: updatedPodcast[0].lastSync });

          resolve();
        });

      });
    });

  });
};

VimeoSync.prototype.getResultsPage = function(user, podcast, page, headers) {
  return new Promise(resolve => {
    this.api.request({
      path: `${user}/videos?per_page=50&page=${page}`,
      headers: headers
    }, (error, body, statusCode) => {
      if (error || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error(`${podcast.id}: Vimeo API returned status code ${statusCode}.`);
        return resolve();
      }

      this.processPage(body, podcast).then(resolve);
    });
  });
};

VimeoSync.prototype.processPage = function(results, podcast) {
  return new Promise(resolve => {
    var videosToProcess = [];

    results.data.forEach(video => {
      if (!video.tags) return;
      if (video.privacy && video.privacy.view !== 'anybody') return;

      video.tags.forEach(tag => {
        if (podcast.sourceMeta.toString().toLowerCase().indexOf(tag.name.toLowerCase()) === -1)
          return;

        videosToProcess.push(this.podcastMediaUpsert(video, podcast));
      });
    });

    if (videosToProcess.length < 1) return resolve();

    sails.log.info(`${podcast.id}: Page ${results.page} - found ${videosToProcess.length} matching videos.`);
    Promise.all(videosToProcess).then(resolve);
  });
};

VimeoSync.prototype.podcastMediaUpsert = function(video, podcast) {
  return new Promise(resolve => {
    if (!video) return resolve();

    var videoId = video.uri.toString().replace('/videos/', '');

    if (!videoId) return resolve();

    var videoTags = [];
    if (video.tags) {
      video.tags.forEach(tag => videoTags.push(tag.name));
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
      variants: videoVariants
    };

    // First we attempt to update a record with the latest data if it exists.
    PodcastMedia.update({ uuid: videoId, podcast: podcast.id }, payload, (err, media) => {

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

      PodcastMedia.create(payload, (err, media) => {
        if (err) sails.log.error(err);

        PodcastMedia.publishCreate(media);
        resolve();
      });

    });
  });
};

module.exports = VimeoSync;
