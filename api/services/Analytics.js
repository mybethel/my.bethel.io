const records = new require('elasticsearch').Client(Object.assign({}, sails.config.elasticsearch));

exports.registerHit = (objectType, objectId, req, properties) => {
  var collection = objectType.split('.');
  var record = {
    object: objectId,
    properties: properties,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    userIp: req.headers['x-forwarded-for'] || req.ip
  };

  if (record.properties.ministry) {
    record.ministry = record.properties.ministry;
    delete record.properties.ministry;
  }

  records.create({
    index: collection[0],
    type: collection[1],
    body: record
  }).then(sails.log.verbose).catch(sails.log.error);

};
