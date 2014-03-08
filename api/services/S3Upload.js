var crypto = require('crypto'),
    moment = require('moment');

exports.prepare = function(bucketName) {
  var p = policy(bucketName);
      s = signature(p);

  return({
    policy: p,
    signature: s,
    key: sails.config.aws.accessKeyId,
    bucket: bucketName
  });
};

signature = function(policy) {
  return crypto.createHmac('sha1', sails.config.aws.secretAccessKey).update(policy).digest('base64');
};

policy = function(bucketName) {
  var s3Policy = {
    expiration: moment.utc().add('minutes', 30).format('YYYY-MM-DDTHH:mm:ss\\Z'),
    conditions: [
      { bucket: 'cloud.bethel.io' },
      { acl: 'public-read' },
      { success_action_status: '201' },
      ['starts-with', '$key', bucketName],
    ]
  };

  return new Buffer(JSON.stringify(s3Policy)).toString('base64');
};
