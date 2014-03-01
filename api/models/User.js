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

    toJSON: function() {
      var obj = this.toObject();
      delete password;
      return obj;
    }
    
  }

};
