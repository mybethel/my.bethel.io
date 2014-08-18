var moment = require('moment'),
    Vimeo = require('vimeo-api').Vimeo;

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

function queryVimeoAPI(podcast, user, token, pageNumber, modifiedCheck) {
  var VimeoAPI = new Vimeo('4990932cb9c798b238e98108b4890c59497297ba'),
      queryHeaders = {
        'Authorization': 'Bearer ' + token
      };

  if (modifiedCheck) {
    queryHeaders['If-Modified-Since'] = moment().subtract('minutes', 6).toString();
  }

  VimeoAPI.request({
    path: user + '/videos?page=' + pageNumber,
    headers: queryHeaders
  }, function (error, body, statusCode, headers) {
    if (error || (statusCode === 304 && modifiedCheck) || statusCode !== 200 || (!body && !body.data)) {
      sails.log.error('Vimeo API returned status code ' + statusCode + ' for podcast ' + podcast.id + '.');
      return;
    }

    body.data.forEach(function(video) {
      if (video.tags) {
        video.tags.forEach(function(tag) {
          if (podcast.sourceMeta.toLowerCase().indexOf(tag.name.toLowerCase()) >= 0) {
            podcastMediaUpsert(video, podcast);
          }
        });
      }
    });

    if (body.paging.next) {
      queryVimeoAPI(podcast, user, token, pageNumber + 1, modifiedCheck);
    }
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
}

exports.sync = function(refreshAll) {
  refreshAll = typeof refreshAll !== 'undefined' ? refreshAll : false;

  sails.log.info('Syncing Vimeo storage.');

  Podcast.find({source: 2}, function foundPodcasts(err, podcasts) {
    if (err) return sails.log.error(err);

    podcasts.forEach(function(podcast) {
      if (!podcast.service || !podcast.sourceMeta) {
        sails.log.warn('Vimeo account or tags not defined for podcast ' + podcast.id + '.');
        return;
      }

      Services.findOne(podcast.service, function foundService(err, service) {
        if (err || !service) {
          sails.log.error('Vimeo service not defined for podcast ' + podcast.id + '.');
          return;
        }

        queryVimeoAPI(podcast, service.user, service.accessToken, 1, !refreshAll);
      });
    });
  });

};

exports.syncOne = function(podcast, service) {

  Podcast.findOne(podcast, function foundPodcast(err, podcastObject) {
    if (err || !podcastObject.sourceMeta) {
      sails.log.error('Vimeo meta tags not defined for podcast ' + podcast.id + '.');
      return;
    }

    Services.findOne(service, function foundService(err, serviceObject) {
      if (err || !service) {
        sails.log.error('Vimeo service not defined for podcast ' + podcast.id + '.');
        return;
      }

      queryVimeoAPI(podcastObject, serviceObject.user, serviceObject.accessToken, 1, false);
    });

  });

}
