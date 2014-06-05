var moment = require('moment'),
    ObjectID = require('mongodb').ObjectID,
    Vimeo = require('vimeo-api').Vimeo;

exports.sync = function(options) {

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

        queryVimeoAPI(podcast, service.user, service.accessToken, 1);
      });
    });
  });

};

function queryVimeoAPI(podcast, user, token, pageNumber) {
  var VimeoAPI = new Vimeo('4990932cb9c798b238e98108b4890c59497297ba');

  VimeoAPI.request({
    path: user + '/videos?page=' + pageNumber,
    headers: {
      'Authorization': 'Bearer ' + token,
      'If-Modified-Since': moment().subtract('minutes', 6).toString()
    }
  }, function (error, body, status_code, headers) {
    if (error || status_code != 200) {
      if (status_code == 304) {
        sails.log.info('Vimeo returned not modified for ' + podcast.id + '.');
      } else {
        sails.log.error('Vimeo API returned status code ' + status_code + ' for podcast ' + podcast.id + '.');
      }
      return;
    }

    if (body && body.data) {
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
        queryVimeoAPI(podcast, user, token, pageNumber + 1);
      }
    }
  });
}

function podcastMediaUpsert(video, podcast) {
  var videoId = video.uri.toString().replace('/videos/', '');

  if (!videoId) return;

  var videoTags = [];
  video.tags.forEach(function(tag) {
    videoTags.push(tag.name);
  });

  var videoThumbnail = '';
  video.pictures.forEach(function(picture) {
    if (picture.width == 200)
      videoThumbnail = picture.link;
  });

  var videoUrl = '';
  video.files.forEach(function(file) {
    if (file.quality == 'sd')
      videoUrl = file.link_secure;
  });

  PodcastMedia.findOrCreate({
    uuid: videoId,
    podcast: new ObjectID(podcast.id)
  }, {
    name: video.name,
    date: new Date(video.created_time),
    description: video.description,
    tags: videoTags,
    duration: video.duration,
    thumbnail: videoThumbnail,
    url: videoUrl,
    uuid: videoId,
    podcast: new ObjectID(podcast.id)
  }, function podcastMediaCreated(err, media) {
    if (err) sails.log.error(err);
  });
}
