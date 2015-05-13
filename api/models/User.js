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

    roles: {
      type: 'array'
    },

    lastLogin: {
      type: 'date'
    },

    isLocked: {
      type: 'boolean'
    },

    hasRole: function(roleName) {

      if (!this.roles || this.roles.indexOf(roleName) == -1) {
          return false;
      }

      return true;

    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }

  },

  beforeCreate: function(values, next) {
    delete values.id;
    Passwords.encryptPassword({ password: values.password }).exec({
      error: function(err) {
        next(err);
      },
      success: function(result) {
        values.password = result;
        values.avatar = Gravatar.url(values.email, {s: 100, d: 'mm'}, true);
        next();
      }
    });
  },

  beforeUpdate: function(values, next) {

    console.log(values);

    var finish = function() {
      if (values.email) {
        values.avatar = Gravatar.url(values.email, {s: 100, d: 'mm'}, true);
      }

      if (values.invite) {
        Ministry.findOne(values.invite, function (err, ministry) {
          if (err) return next(err);

          if (ministry) {
            values.ministry = ministry.id;
          }

          next();
        });
      } else {
        next();
      }
    };

    if (values.password) {
      Passwords.encryptPassword({ password: values.password }).exec({
        error: function(err) {
          next(err);
        },
        success: function(result) {
          values.password = result;
          finish();
        }
      });
    } else {
      finish();
    }
  }

};
