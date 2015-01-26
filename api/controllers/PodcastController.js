/**
 * PodcastController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var moment = require('moment'),
    xml2js = require('xml2js'),
    request = require('request'),
    async = require('async');

function finishMediaImport(id, ministry) {
  console.log('Finished import for podcast ' + id);
}

function processMediaImport(id, media, ministry) {
  var filename = media[0].url.split('/').slice(-1);
  sails.log.debug('Transporting ' + filename[0] + ' to s3://podcast/' + ministry + '/' + id);

  S3Upload.transport(media[0].url, 'podcast/' + ministry + '/' + id, filename[0], function (err) {
    if (err)
      sails.log.error(err);

    media.shift();
    
    if (media && media[0]) {
      processMediaImport(id, media, ministry);
    } else {
      finishMediaImport(id, ministry);
    }
  });
}

module.exports = {

  list: function (req, res) {
    Podcast.find({ministry: req.session.Ministry.id}).exec(function (err, podcasts) {
      if (err) return next(err);
      res.send(podcasts);
    });
  },

  new: function (req, res) {
    res.send(S3Upload.prepare('images/podcast/tmp'));
  },

  import: function(req, res) {
    if (!req.param('url'))
      return res.send(403, 'no feed provided');

    request(req.param('url'), function (error, response, body) {
      if (error || response.statusCode !== 200)
        return res.send(503, 'unable to load feed');

      xml2js.parseString(body, function (err, result) {
        // Ensure the XML feed has at least one item to import.
        if (err || !result.rss.channel[0].item || result.rss.channel[0].item.length < 1)
          return res.send(503, 'invalid feed');

        var feed = result.rss.channel[0],
            podcastImage = feed['itunes:image'][0].$.href,
            podcastImageExtension = podcastImage.split('.').slice(-1),
            media = [];

        async.each(feed.item, function (item, callback) {
          if (!item.enclosure || !item.enclosure[0])
            return callback();

          media.push({
            name: item.title[0],
            date: item.pubDate[0],
            description: item['itunes:summary'][0],
            url: item.enclosure[0].$.url,
          });

          callback();
        }, function (err) {
          if (err)
            return sails.log.error(err);

          var mediaUrl = media[0].url,
              mediaType = 2;

          // Determine the type of podcast from the first enclosure URL.
          // @todo: this needs to be more flexible
          if (mediaUrl.indexOf('.mp3') !== -1 || mediaUrl.indexOf('.m4a') !== -1)
            mediaType = 1;

          Podcast.create({
            name: feed.title[0],
            type: mediaType,
            source: 1,
            import: media,
            description: feed.description[0],
            tags: feed['itunes:keywords'][0],
            copyright: feed.copyright[0],
            ministry: req.session.Ministry.id,
          }, function podcastCreated(err, podcast) {
            if (err)
              return res.send(503, err);

            // Upload the podcast thumbnail to S3.
            S3Upload.transport(podcastImage, 'images/podcast', podcast.id + '.' + podcastImageExtension, function (err) {
              if (err) {
                sails.log.error('Unable to transport podcast image ' + podcastImage);
              } else {
                Podcast.update(podcast.id, {image: '/podcast' + podcast.id + '.' + podcastImageExtension});
              }

              processMediaImport(podcast.id, podcast.import, req.session.Ministry.id);
            });

            res.redirect('/podcast/show/' + podcast.id);
          });
        });
      });
    });
  },

  edit: function (req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) return next(err);

      var uploadForm = S3Upload.prepare('images/podcast/tmp');
    
      Service.find({provider: 'vimeo', ministry: req.session.Ministry.id}, function foundServices(err, services) {
        res.send({
          s3form: uploadForm,
          uploadEpisode: S3Upload.prepare('podcast/' + podcast.ministry + '/' + podcast.id),
          podcast: podcast,
          services: services
        });
      });
    });
  },

  destroy: function(req, res) {
    Podcast.destroy(req.param('id'), function deletedPodcast(err, podcast) {
      if (err) sails.log.error(err);

      PodcastMedia.destroy({podcast: req.param('id')}, function deletedPodcastMedia(err, podcastMedia) {
        if (err) sails.log.error(err);

        res.redirect('/podcasts');
      });

    });
  },

  show: function (req, res) {
    Podcast.findOne(req.param('id')).populate('ministry').populate('media', { sort: { date: 0 } }).exec(function (err, podcast) {
      if (err) return next(err);

      // Verify that the user has access to view this page.
      if (podcast.ministry.id !== req.session.Ministry.id)
        return res.forbidden('You must be a member of the ministry to edit this podcast.');

      // If this is an audio podcast show the upload form.
      if (podcast.type === 1) {
        podcast.s3form = S3Upload.prepare('podcast/' + podcast.ministry.id + '/' + podcast.id);
      }

      // Generate statistics data for the analytics graph.
      podcast.statisticsGraph = Analytics.generateGraphData('podcast', req.param('id'), 6);

      res.view({
        podcast: podcast,
        ministry: podcast.ministry,
        podcastMedia: podcast.media
      });      
    });
  },

  feed: function (req, res) {
    Podcast.findOne(req.param('id')).populate('ministry').populate('media', { sort: { date: 0 } }).exec(function (err, podcast) {
      if (err) res.send(err, 500);
      if (!podcast) res.send(404);

      Analytics.registerHit('podcast', req.param('id'));

      res.header('Content-Type', 'text/xml; charset=UTF-8');

      res.view({
        layout: 'rss',
        podcast: podcast,
        ministry: podcast.ministry,
        podcastMedia: podcast.media
      });
    });
  },

  subscribers: function(req, res) {
    var statsDate = Number(moment().subtract('week', 1).format('GGGGWW'));

    Stats.findOne({object: req.param('id'), type: 'podcast', date: statsDate}, function foundStatsTracking(err, stat) {
      if (err) return sails.log.error('Finding stats: ' + err);

      if (!stat) return res.send(200, {subscribers: 0});

      return res.send(200, {
        podcast: req.param('id'),
        subscribers: Math.round(stat.count/7)
      });
    });
  },

};
