var moment = require('moment'),
    Promise = require('bluebird'),
    Vimeo = require('vimeo-api').Vimeo,
    VimeoAPI = new Vimeo('4990932cb9c798b238e98108b4890c59497297ba');

function podcastMediaUpsert(video, podcast) {
  var videoId = video.uri.toString().replace('/videos/', '');

  if (!videoId) return;

  var videoTags = [];
  video.tags.forEach(function(tag) {
    videoTags.push(tag.name);
  });

  var videoThumbnail = '';
  video.pictures.forEach(function(picture) {
    if (picture.width === 200)
      videoThumbnail = picture.link;
  });

  var videoUrl = '';
  video.files.forEach(function(file) {
    if (file.quality === 'sd')
      videoUrl = file.link_secure;
  });

  PodcastMedia.findOrCreate({
    uuid: videoId,
    podcast: podcast.id
  }, {
    name: video.name,
    date: new Date(video.created_time),
    description: video.description,
    tags: videoTags,
    duration: video.duration,
    thumbnail: videoThumbnail,
    url: videoUrl,
    uuid: videoId,
    podcast: podcast.id
  }, function podcastMediaCreated(err, media) {
    if (err) sails.log.error(err);
  });
}

var vimeo = {};

vimeo.refreshAll = false;

vimeo.sync = function(refreshAll) {
  this.refreshAll = typeof refreshAll !== 'undefined' ? refreshAll : false;
  sails.log.info('Syncing Vimeo storage.');

  return new Promise(function(resolve, reject) {

    Podcast.find({ source: 2 }, function foundPodcasts(err, podcasts) {
      if (err) return reject(err);

      podcasts.map(function(podcast) {
        return vimeo.syncPodcast(podcast);
      });

      Promise.all(podcasts).then(function() {
        sails.log.info('Vimeo sync completed.');
        resolve();
      });
    });

  });

};

vimeo.syncPodcast = function(podcast) {
  return new Promise(function(resolve, reject) {
    if (!podcast.service || !podcast.sourceMeta) {
      sails.log.warn('Vimeo account or tags not defined for podcast ' + podcast.id + '.');
      return reject();
    }

    Service.findOne(podcast.service, function foundService(err, service) {
      if (err || !service) {
        sails.log.error('Vimeo service not defined for podcast ' + podcast.id + '.');
        return reject();
      }

      vimeo.queryApi(podcast, service.user, service.accessToken).then(resolve);
    });
  });
}

vimeo.syncOne = function(podcast, service) {

  Podcast.findOne(podcast, function foundPodcast(err, podcastObject) {
    if (err || !podcastObject.sourceMeta) {
      sails.log.error('Vimeo meta tags not defined for podcast ' + podcast.id + '.');
      return;
    }

    Service.findOne(service, function foundService(err, serviceObject) {
      if (err || !service) {
        sails.log.error('Vimeo service not defined for podcast ' + podcast.id + '.');
        return;
      }

      vimeo.queryApi(podcastObject, serviceObject.user, serviceObject.accessToken);
    });

  });

};

vimeo.queryApi = function(podcast, user, token) {
  return new Promise(function(resolve, reject) {
    var queryHeaders = { 'Authorization': 'Bearer ' + token };

    if (!vimeo.refreshAll) {
      queryHeaders['If-Modified-Since'] = moment().subtract('minutes', 6).toString();
    }

    VimeoAPI.request({
      path: user + '/videos',
      headers: queryHeaders
    }, function (error, body, statusCode, headers) {
      if (error || (statusCode === 304 && !vimeo.refreshAll) || statusCode !== 200 || (!body && !body.data)) {
        sails.log.error('Vimeo API returned status code ' + statusCode + ' for podcast ' + podcast.id + '.');
        return resolve();
      }

      if (body.total > body.page * body.per_page) {
        var totalPages = Math.ceil(body.total - (body.page * body.per_page) / body.per_page);
      }

    body.data.forEach(function(video) {
      if (video.tags) {
        video.tags.forEach(function(tag) {
          if (podcast.sourceMeta.toString().toLowerCase().indexOf(tag.name.toLowerCase()) >= 0) {
            podcastMediaUpsert(video, podcast);
          }
        });
      }
    });
  });

  // Search for Vimeo podcast media that are missing a URL.
  PodcastMedia.find({ url: '', podcast: podcast.id }, function foundMedia(err, media) {
    sails.log('Found ' + media.length + ' media with missing URLs.');

    media.forEach(function (video) {
      VimeoAPI.request({
        path: '/videos/' + video.uuid,
        headers: queryHeaders
      }, function (error, body, statusCode, headers) {
        if (!body || !body.files) {
          sails.log.error('Vimeo API returned status code ' + statusCode + ' for video ' + video.uuid + '.');
          return;
        }

        body.files.forEach(function(file) {
          if (file.quality === 'sd') {
            PodcastMedia.update(video.id, { url: file.link_secure }, function podcastUpdated(err, updatedMedia) {
              if (err)
                return sails.log.error(err);

              sails.log('Updated Vimeo URL to ' + file.link_secure + ' for media: ' + video.id);
            });
          }
        });
      })
    });
  })
};

module.exports = vimeo;
