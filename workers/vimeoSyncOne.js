module.exports.run = function(cb, podcast) {
  new VimeoStorageSync(false, podcast).then(cb);
}
