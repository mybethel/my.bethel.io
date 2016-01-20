var pm2 = require('pm2');

var MACHINE_NAME = 'bethel';
var PRIVATE_KEY  = process.env.KEYMETRICS;
var PUBLIC_KEY   = 'a29ip044sbl22md';

var instances = process.env.WEB_CONCURRENCY || -1;
var maxMemory = process.env.WEB_MEMORY      || 512;

pm2.connect(function() {
  pm2.start({
    script    : 'app.js',
    name      : 'bethel',
    instances : instances,
    max_memory_restart :  `${maxMemory}M`,
    args      : ['--prod'],
    env: {
      'NODE_ENV': 'production',
    }
  }, function() {
    pm2.interact(PRIVATE_KEY, PUBLIC_KEY, MACHINE_NAME, function() {

     // Display logs in standard output
     pm2.launchBus(function(err, bus) {
       console.log('[PM2] Log streaming started');

       bus.on('log:out', function(packet) {
        console.log('[App:%s] %s', packet.process.name, packet.data);
       });

       bus.on('log:err', function(packet) {
         console.error('[App:%s][Err] %s', packet.process.name, packet.data);
       });
      });

    });
  });
});
