/**
 * ministrySession
 *
 * @module      :: Policy
 * @description :: Blocks podcast access if podcast ministry does not match
 *                 user's session ministry
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  if (req.options.controller && req.options.controller === 'podcast') {
    validatePodcastOwnership();
  } else {
    return res.forbidden();
  }

  function validatePodcastOwnership() {

    Podcast.findOne(req.param('id'), function (err, podcast) {

      if (err) return res.badRequest();

      if (podcast.ministry !== req.session.ministry) {
        console.log('FORBIDDEN');
        return res.forbidden();
      } else {
        console.log('THATS OK');
        return next();
      }

    });

  }

};
