/**
 * MediaController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  browser: function (req, res) {
    if (!req.session.Ministry)
      return res.forbidden('Your account is not associated with a ministry.');

    Media.find({ministry: req.session.Ministry.id}).exec(function (err, results) {

      return res.send({
        media: results,
        upload: S3Upload.prepare('media/' + req.session.Ministry.id)
      });

    });
  }
	
};
