var Zencoder = require('zencoder')(sails.config.zencoder.key);

exports.checkJob = function(jobId, cb) {
  Zencoder.Job.details(jobId, function (err, details) {
    if (!details.job.finished_at) {
      setTimeout(function () {
        VideoEncoding.checkJob(jobId, cb);
      }, 5000);
    } else {
      cb(details.job);
    }
  });
};

exports.getMetadata = function(file, ministry, cb) {
  Zencoder.Job.create({
    "input": "http://cloud.bethel.io/" + file,
    "grouping": "ministry-" + ministry,
    "output": [{
      "skip": {
        "max_duration": 1
      }
    }]
  }, function (err, createdJob) {
    VideoEncoding.checkJob(createdJob.id, cb);
  });
};