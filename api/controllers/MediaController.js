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

    return res.send({
      upload: S3Upload.prepare('media/' + req.session.Ministry.id)
    });
  }
	
};
