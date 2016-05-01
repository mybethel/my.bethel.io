var videoResult = require('./vimeoPage');

module.exports = {
  total: 102,
  page: 2,
  per_page: 50,
  paging: {
    next: '/users/thebrookchurch/videos?page=3&per_page=50',
    previous: '/users/thebrookchurch/videos?page=1&per_page=50',
    first: '/users/thebrookchurch/videos?page=1&per_page=50',
    last: '/users/thebrookchurch/videos?page=3&per_page=50'
  },
  data: [
    videoResult
  ]
};
