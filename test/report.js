var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var sailsCoverage = './coverage/sails/coverage.json';

fs.readFile(sailsCoverage, 'utf8', function (err, data) {
  if (err) throw err;

  data = JSON.parse(data);
  var relativeData = {};
  for (var file in data) {
    data[file].path = './' + path.relative(process.cwd(), data[file].path);
    relativeData['./' + path.relative(process.cwd(), file)] = data[file];
  }

  fs.writeFileSync(sailsCoverage, JSON.stringify(relativeData), 'utf8');

  exec('./node_modules/.bin/istanbul report lcov');

});
