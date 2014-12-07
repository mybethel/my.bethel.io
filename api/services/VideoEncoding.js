var Zencoder = require('zencoder')(sails.config.zencoder.key);

exports.transcode = function(media) {
  var mediaKey = 'media/' + media.ministry + '/' + media.id + '/original.' + media.extension;

  this.originalMedia = media;
  this.profile = {
    'input': 's3://cloud.bethel.io/' + mediaKey,
    'grouping': 'ministry-' + media.ministry,
  };

  return this;
};

exports.usingProfile = function(profile) {

  var storageLocation = 's3://cloud.bethel.io/media/' + this.originalMedia.ministry + '/' + this.originalMedia.id + '/';

  switch (profile) {

    case 'audio':
      this.profile.output = [{
        'skip_video': true,
        'format': 'm4a',
        'audio_codec': 'aac',
        'url': storageLocation + 'audio.m4a'
      }];

  }
  
  return this;
};

exports.exec = function(cb) {
  Zencoder.Job.create(this.profile, cb);
};

exports.checkJob = function(jobId, cb) {
  Zencoder.Job.details(jobId, function (err, details) {
    if (!details || !details.job.finished_at) {
      setTimeout(function () {
        VideoEncoding.checkJob(jobId, cb);
      }, 5000);
    } else {
      cb(details.job);
    }
  });
};

exports.getMetadata = function(filePath, ministryId, cb) {
  Zencoder.Job.create({
    "input": "s3://cloud.bethel.io/" + filePath,
    "grouping": "ministry-" + ministryId,
    "output": [{
      "skip": {
        "max_duration": 1
      }
    }]
  }, function (err, createdJob) {
    if (err)
      return sails.log.error(err);

    VideoEncoding.checkJob(createdJob.id, cb);
  });
};

exports.encodePreview = function(filePath, fileId, ministryId, cb) {
  Zencoder.Job.create({
    "input": "s3://cloud.bethel.io/" + filePath,
    "grouping": "ministry-" + ministryId,
    "output": [{
      "audio_bitrate": 256,
      "clip_length": 30,
      "size": "720x576",
      "start_clip": 0,
      "h264_profile": "high",
      "h264_level": "3.0",
      "max_frame_rate": 30,
      "public": 1,
      "thumbnails": {
        "base_url": "s3://cloud.bethel.io/media/" + ministryId + "/" + fileId + "/thumbnails",
        "format": "jpg",
        "number": 4,
        "public": 1
      },
      "url": "s3://cloud.bethel.io/media/" + ministryId + "/" + fileId + "/preview.mp4"
    }]
  }, function (err, createdJob) {
    if (err)
      return sails.log.error(err);

    VideoEncoding.checkJob(createdJob.id, cb);
  });
};