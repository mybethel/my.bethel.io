/**
 * PodcastController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  list: function (req, res) {
    Podcast.find({ministry: req.session.Ministry.id}, function foundPodcasts(err, podcasts) {
      if (err) return next(err);

      res.view({
        podcasts: podcasts
      });
    });
  },

  new: function (req, res) {
    uploadForm = S3Upload.prepare('images/tmp/podcast');
    res.view({
      s3form: uploadForm
    });
  },

  create: function (req, res) {
    Podcast.create(req.params.all(), function podcastCreated(err, podcast) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcast/new');
      }
      req.session.flash = {};

      return res.redirect('/podcasts');
    });
  },

  edit: function (req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) return next(err);

      uploadForm = S3Upload.prepare('images/tmp/podcast');
    
      res.view({
        s3form: uploadForm,
        podcast: podcast
      });
    });
  },

  update: function(req, res) {
    Podcast.update(req.param('id'), req.params.all(), function podcastUpdated(err) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcast/edit/' + req.param('id'));
      }
      req.session.flash = {};

      return res.redirect('/podcast/show/' + req.param('id'));
    })
  },

  show: function (req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) return next(err);

      PodcastMedia.find().sort('date desc').where({podcast: podcast.id}).exec(function(err, media) {
        if (err) return next(err);

        res.view({
          podcast: podcast,
          podcastMedia: media
        });
      });
    });
  },
	
};
