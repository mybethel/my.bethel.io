/**
 * MediaController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var AWS = require('aws-sdk'),
    Zencoder = require('zencoder')(sails.config.zencoder.key);

module.exports = {

  browser: function (req, res) {
    if (!req.session.Ministry)
      return res.forbidden('Your account is not associated with a ministry.');

    Media.find({ministry: req.session.Ministry.id}).exec(function (err, results) {

      return res.send({
        media: results,
        upload: S3Upload.prepare('media/' + req.session.Ministry.id)
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
