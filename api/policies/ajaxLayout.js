module.exports = function(req, res, next) {

  req.viewData = {};

  if (req.wantsJSON === true) {
    req.viewData.layout = 'ajax';
  } else {
    req.viewData.layout = 'layout';
  }

  next();

};
