/**
 * MediaController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var AWS = require('aws-sdk');

module.exports = {

  browser: function (req, res) {
    if (!req.session.Ministry)
      return res.forbidden('Your account is not associated with a ministry.');

    var criteria = { ministry: req.session.Ministry.id };
    if (req.param('id') !== 'all') criteria.or = [{ tags: req.param('id')}, { type: 'collection'}];

    Media.find().where(criteria).exec(function (err, results) {
      var collections = [],
          selectedCollection = {};

      Media.watch(req.socket);
      Media.subscribe(req.socket, results);

      results = results.filter(function (result) {
        if (result.type == 'collection') {
          collections.push(result);
          if (req.param('id') !== 'all' && result.id == req.param('id')) {
            selectedCollection = result;
          } 
          return false;
        }
        return true;
      });
      return res.send({
        media: results,
        collections: collections,
        selectedCollection: selectedCollection,
        upload: S3Upload.prepare('media/' + req.session.Ministry.id)
      });

    });
  },

  collections: function (req, res) {
    if (!req.session.Ministry)
      return res.forbidden('Your account is not associated with a ministry.');

    Media.find().where({ ministry: req.session.Ministry.id, type: 'collection', name : {'contains' : req.param('id')} }).exec(function (err, results) {
      var collections = [];

      Media.watch(req.socket);
      Media.subscribe(req.socket, results);

      results.forEach(function (result) {
        collections.push({ id: result.id, text: result.name });
      });
      return res.send(collections);
    });
  },

  transcode: function(req, res) {
    if (!req.param('id') || !req.param('profile'))
      return res.serverError('A valid media ID and transcoding profile is required.');

    Media.findOne(req.param('id')).exec(function (err, media) {
      if (req.session.Ministry.id !== media.ministry)
        return res.forbidden('Media transcoding can only be requested by the clip owner.');

      VideoEncoding.transcode(media).usingProfile(req.param('profile')).exec(function (err, createdJob) {
        var transcodingProgress = {};
        transcodingProgress['video_t_' + req.param('profile')] = 'TRANSCODE_IN_PROGRESS:' + createdJob.id;

        Media.update(req.param('id'), transcodingProgress, function (err) {
          return res.send(createdJob);
        });
      });
    });
  },

  meta: function (req, res) {
    if (!sails.config.aws.accessKeyId || !sails.config.aws.secretAccessKey)
      return res.serverError('Required AWS credentials not set.');

    AWS.config.update(sails.config.aws);
    var s3 = new AWS.S3();

    Media.findOne(req.param('id')).exec(function (err, media) {

      var mediaKey = 'media/' + media.ministry + '/' + media.id + '/original.' + media.extension;

      if (media.type === 'video') {
        VideoEncoding.encodePreview(mediaKey, media.id, media.ministry, function (jobDetails) {
          Media.update(req.param('id'), {
            audio_bitrate: jobDetails.input_media_file.audio_bitrate_in_kbps,
            audio_codec: jobDetails.input_media_file.audio_codec,
            audio_samplerate: jobDetails.input_media_file.audio_sample_rate,
            duration: jobDetails.input_media_file.duration_in_ms,
            format: jobDetails.input_media_file.format,
            framerate: jobDetails.input_media_file.frame_rate,
            height: jobDetails.input_media_file.height,
            video_bitrate: jobDetails.input_media_file.video_bitrate_in_kbps,
            video_codec: jobDetails.input_media_file.video_codec,
            video_frames: jobDetails.thumbnails.length,
            width: jobDetails.input_media_file.width
          }, function mediaUpdated(err) {
            if (err)
              sails.log.error(err);
          });
        });
      }
      else if (media.type === 'audio') {
        VideoEncoding.getMetadata(mediaKey, media.ministry, function (jobDetails) {
          Media.update(req.param('id'), {
            audio_bitrate: jobDetails.input_media_file.audio_bitrate_in_kbps,
            audio_codec: jobDetails.input_media_file.audio_codec,
            audio_samplerate: jobDetails.input_media_file.audio_sample_rate,
            duration: jobDetails.input_media_file.duration_in_ms,
            format: jobDetails.input_media_file.format
          }, function mediaUpdated(err) {
            if (err)
              sails.log.error(err);
          });
        });
      }

      s3.headObject({
        Bucket: 'cloud.bethel.io',
        Key: mediaKey,
      }, function(err, data) {
        if (err)
          return res.serverError(err);
        
        Media.update(req.param('id'), {
          size: data.ContentLength
        }, function mediaUpdated(err) {
          if (err)
            sails.log.error(err);
        });

        return res.send(data);
      });

    });
  }
	
};
