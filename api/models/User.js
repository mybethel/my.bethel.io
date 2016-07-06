/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

const crypto = require('crypto');
const Passwords = require('machinepack-passwords');

module.exports = {

  schema: true,

  attributes: {

    name: {
      type: 'string',
      required: true
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

    ministriesAuthorized: {
      type: 'array'
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

    getAvatar(size) {
      const hash = crypto.createHash('md5').update(this.email).digest('hex');
      return `//gravatar.com/avatar/${hash}.png?d=mm&s=${size || ''}`;
    },

    hasRole: function(roleName) {

      if (!this.roles || this.roles.indexOf(roleName) === -1) {
        return false;
      }

      return true;

    },

    loginSuccess: function() {
      User.update(this.id, { lastLogin: new Date() }, function(err) {
        if (err) sails.log.error(err);
      });
    },

    toJSON: function() {
      this.avatar = this.getAvatar(200);
      var obj = this.toObject();

      obj.inviteCode = new Buffer(obj.id, 'hex')
        .toString('base64')
        .replace('+', '-')
        .replace('/', '_');

      delete obj.password;
      return obj;
    }

  },

  beforeCreate: function(values, next) {
    delete values.id;

    if (!values.password) return next();

    Passwords.encryptPassword({ password: values.password }).exec({
      error: function(err) {
        next(err);
      },
      success: function(result) {
        values.password = result;
        next();
      }
    });
  },

  afterCreate: function(values, next) {
    if (values.password && values.password !== '') return next();

    values.password = new Buffer(values.id, 'hex')
      .toString('base64')
      .replace('+', '-')
      .replace('/', '_');

    User.update(values.id, { password: values.password }, function userUpdated(err) {
      if (err) return next(err);

      next();
    });
  },

  beforeUpdate: function(values, next) {
    if (!values.password) return next();

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

};
