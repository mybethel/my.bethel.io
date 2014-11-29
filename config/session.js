/**
 * Session
 * 
 * Sails session integration leans heavily on the great work already done by Express, but also unifies 
 * Socket.io with the Connect session store. It uses Connect's cookie parser to normalize configuration
 * differences between Express and Socket.io and hooks into Sails' middleware interpreter to allow you
 * to access and auto-save to `req.session` with Socket.io the same way you would with Express.
 *
 * For more information on configuring the session, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.session = {

  // Session secret is automatically generated when your new app is created
  // Replace at your own risk in production-- you will invalidate the cookies of your users,
  // forcing them to log in again. 
  secret: '086126214755f76f953e0240a6d73474',


  // Set the session cookie expire time
  // The maxAge is set by milliseconds, the example below is for 24 hours
  //
  // cookie: {
  //   maxAge: 24 * 60 * 60 * 1000  
  // }
  
  
  adapter: 'connect-mongostore',
  collection: 'sessions',

  db: {
    name: 'mybethel',
    servers: [
      {
        host: 'candidate.13.mongolayer.com',
        port: '10300'
      },
      {
        host: 'candidate.12.mongolayer.com',
        port: '10300'
      }
    ]
  },
  
  username: 'mybethel-prod',
  password: process.env.MONOGO_PASS

  //
  // username: '',
  // password: '',
  // auto_reconnect: false,
  // ssl: false,
  // stringify: true

};
