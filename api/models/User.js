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
      return this.roles && this.roles.indexOf(roleName) >= 0;
    },

    loginSuccess: function() {
      this.lastLogin = new Date();
      this.save();
    },

    toJSON: function() {
      var obj = this.toObject();
      obj.inviteCode = User.inviteCode(obj.email);
      delete obj.password;
      return obj;
    }

  },

  beforeCreate: function(values, next) {
    delete values.id;

    var hash = crypto.createHash('md5').update(values.email).digest('hex');
    values.avatar = `//gravatar.com/avatar/${hash}.png?d=mm&s=100`;

    if (!values.password || values.password === '') {
      values.password = this.inviteCode(values.email);
    }

    Passwords.encryptPassword({ password: values.password }).exec({
      error: next,
      success: function(result) {
        values.password = result;
        next();
      }
    });
  },

  beforeUpdate: function(values, next) {

    if (values.email) {
      var hash = crypto.createHash('md5').update(values.email).digest('hex');
      values.avatar = `//gravatar.com/avatar/${hash}.png?d=mm&s=100`;
    }

    if (!values.password) return next();

    Passwords.encryptPassword({ password: values.password }).exec({
      error: next,
      success: function(result) {
        values.password = result;
        next();
      }
    });
  },

  /**
   * A new user can have their password temporarily set to this invite code
   * which is generated off their e-mail address. This allows for a single-click
   * login experience when first interacting with the platform and requires the
   * user to change their password immediately.
   * @param {String} email The user's e-mail address.
   * @return {String} The invite code for this user.
   */
  inviteCode: email => new Buffer(email).toString('base64').replace('+', '-').replace('/', '_')

};
