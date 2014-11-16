/**
 * ImageController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  render: function(req, res) {
    var params = ImageResize.parseParams(req.url);
    ImageResize.resizeFrom('http://cloud.bethel.io/', params, res);
  }
	
};
