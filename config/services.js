module.exports.services = {

  vimeo: {
    key: process.env.VIMEO_CLIENT,
    secret: process.env.VIMEO_SECRET
  },

  youtube: {
    key: '934110394405-4hkvg6be8a6q894449t17q3bs3ntaimq.apps.googleusercontent.com',
    secret: process.env.YOUTUBE,
    scope: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  }

};
