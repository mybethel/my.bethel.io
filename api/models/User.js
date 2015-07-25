/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var Passwords = require('machinepack-passwords'),
    Gravatar = require('gravatar');

module.exports = {

  schema: true,

  attributes: {

    name: {
      type: 'string'
    },

    email: {
      type: 'email',
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

    roles: {
      type: 'array'
    },

    lastLogin: {
      type: 'date'
    },

    isLocked: {
      type: 'boolean'
    },

    invited: {
      type: 'date'
    },

    hasRole: function(roleName) {

      if (!this.roles || this.roles.indexOf(roleName) == -1) {
        return false;
      }

      return true;

    },

    toJSON: function() {
      var obj = this.toObject();

      obj.inviteCode = new Buffer(obj.id, 'hex')
        .toString('base64')
        .replace('+','-')
        .replace('/','_');

      delete obj.password;
      return obj;
    }

  },

  beforeCreate: function(values, next) {
    delete values.id;

    values.avatar = Gravatar.url(values.email, {s: 100, d: 'mm'}, true);

    if (values.password) {
      Passwords.encryptPassword({ password: values.password }).exec({
        error: function(err) {
          next(err);
        },
        success: function(result) {
          values.password = result;
          next();
        }
      });
    }
    else {
      next();
    }
  },

  afterCreate: function(values, next) {

    if (!values.password || values.password === '') {
      values.password = new Buffer(values.id, 'hex')
        .toString('base64')
        .replace('+','-')
        .replace('/','_');

      User.update(values.id, { password: values.password }, function userUpdated(err, user) {
        if (err) return next(err);

        next();
      });
    }
    else {
      next();
    }

  },

  beforeUpdate: function(values, next) {

    if (values.email) {
      values.avatar = Gravatar.url(values.email, { s: 100, d: 'mm' }, true);
    }

    if (values.password) {
      Passwords.encryptPassword({ password: values.password }).exec({
        error: function(err) {
          next(err);
        },
        success: function(result) {
          values.password = result;
          next();
        }
      });
    } else {
      next();
    }
  }

};
