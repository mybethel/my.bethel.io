module.exports.services = {

  vimeo: {
    key: '4990932cb9c798b238e98108b4890c59497297ba',
    secret: process.env.VIMEO
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
