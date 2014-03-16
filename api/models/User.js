/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
    name: {
      type: 'string'
    },

    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },

    password: {
      type: 'string'
    },

  	ministry: {
      model: 'ministry'
    },

    avatar: {
      type: 'string'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    },
    
  },

  beforeCreate: function(values, next) {
    require('bcrypt').hash(values.pass, 10, function passwordEncrypted(err, encryptedPassword) {
      if (err) return next(err);
      values.password = encryptedPassword;

      var gravatar = require('gravatar');
      values.avatar = gravatar.url(values.email, {s: 100, d: 'mm'});

      next();
    });
  },

  beforeUpdate: function(values, next) {
    if (values.email) {
      var gravatar = require('gravatar');
      values.avatar = gravatar.url(values.email, {s: 100, d: 'mm'});
    }

    if (values.invite) {
      // @todo: verify the invite code is actually a ministry ID.
      values.ministry = values.invite;
    }

    next();
  }

};
