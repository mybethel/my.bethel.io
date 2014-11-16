var http = require('http'),
    url = require('url'),
    gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick: true });

var widthRegex = /^\/render\/(\d+)*\//,
    widthHeightRegex = /^\/render\/(\d+)x?(\d+)*\//;

exports.resizeFrom = function(hostname, parameters, res) {
  var parsedBasePath = url.parse(hostname);

  var params = parameters,
      options = {
        hostname: parsedBasePath.hostname,
        port: parsedBasePath.port,
        path: (parsedBasePath.path + params.imagePath).replace('//', '/')
      };

  http.get(options, function(r) {
    if (r.statusCode !== 200) {
      res.statusCode = r.statusCode;
      r.pipe(res);
      return;
    } else {  
      ImageResize.processFileOutput(r, params, res);
    }
  });
};

exports.processFileOutput = function(r, params, res) {
  if (!params.size)
    return r.pipe(res);

  res.writeHeader(200, {"Cache-Control": "max-age=600"});

  var imageStream = imageMagick(r);

  // Maintain aspect ratio if only provided the image width
  if (!params.size.height) {
    imageStream.resize(params.size.width);
  }
  // Otherwise resize and crop the image
  else {
    imageStream
      .resize(params.size.width, params.size.height, '^')
      .gravity('Center')
      .crop(params.size.width, params.size.height);
  }

  return imageStream.stream().pipe(res);
};

exports.parseParams = function(url) {
  var sizeMatch,
      params = {
        imagePath: url.replace(widthRegex, '/').replace(widthHeightRegex, '/')
      };

  if (sizeMatch = url.match(widthRegex)) {
    params.size = {
      width: sizeMatch[1]
    };
  }
  else if (sizeMatch = url.match(widthHeightRegex)) {
    params.size = {
      width: sizeMatch[1],
      height: sizeMatch[2]
    };
  }

  return params;
};
