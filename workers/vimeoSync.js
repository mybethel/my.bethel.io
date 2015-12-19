module.exports.run = function(cb) {
  new VimeoStorageSync().then(cb);
}
