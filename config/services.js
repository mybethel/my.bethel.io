
module.exports.services = {

  vimeo: {
    authorizationURL: 'https://api.vimeo.com/oauth/authorize',
    tokenURL: 'https://api.vimeo.com/oauth/access_token',
    clientID: '4990932cb9c798b238e98108b4890c59497297ba',
    clientSecret: process.env.VIMEO,
    callbackURL: 'https://my.bethel.io/service/authorize/vimeo'
  }

}
