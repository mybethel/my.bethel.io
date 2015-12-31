/**
 * MinistryController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  edit: (req, res) => {
    Ministry.findOne(req.param('id')).exec((err, ministry) => {
      if (err || !ministry) return res.send(err, 500);

      var uploadForm = S3Upload.prepare('images/ministry/tmp');
      var coverUpload = S3Upload.prepare(`images/ministry/${ministry.id}`);

      return res.send({
        ministry: ministry,
        s3form: uploadForm,
        cover: coverUpload
      });
    });
  },

  find: (req, res) => {
    Ministry.find({ id: req.param('id').split(',') }).exec((err, ministries) => {
      if (err) return res.serverError(err);
      return res.send(ministries);
    });
  }

};
