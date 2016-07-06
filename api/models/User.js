// Models: User
// ==
// Users represent all personas that access the Bethel platform. This includes
// end users assigned to ministries, partners who have permission to manage
// multiple ministries, and staff members of Bethel with administrative rights.
const crypto = require('crypto');
const Passwords = require('machinepack-passwords');

module.exports = {

  schema: true,

  /**
   * Attributes
   * --
   * Used to build schema in [Waterline](http://waterlinejs.org).
   */
  attributes: {

    // `name` is the full first and last name of the individual user.
    name: {
      type: 'string',
      required: true
    },

    // `email` is used for the user's contact e-mail and their login username.
    email: {
      type: 'email',
      required: true,
      unique: true
    },

    // `password` is encrypted using `bcrypt` before being saved. Users can be
    // created without a password (hence the field being optional). In this case
    // their default password will be an invite token generated based on their
    // e-mail address.
    password: {
      type: 'string'
    },

    // `ministry` is the single ministry for which the user is associated. Only
    // partner accounts can currently be used to manage multiple ministries.
    ministry: {
      model: 'ministry'
    },

    // `ministriesAuthorized` are used on partner accounts. This allows a single
    // user to be authorized to manage multiple ministries.
    ministriesAuthorized: {
      type: 'array'
    },

    // `roles` represent multiple permission sets a user can possess. This will
    // determine their access to certain sections of the platform.
    roles: {
      type: 'array'
    },

    // `lastLogin` is the last time the user successfully authenticated. Because
    // sessions are not proactively expired, this may not neccesarily represent
    // the last time the user has used the platform.
    lastLogin: {
      type: 'date'
    },

    // `isLocked` enables accounts to be de-activated to prevent logging in.
    isLocked: {
      type: 'boolean'
    },

    // `invited` represents the date the user was sent an e-mail inviting them
    // to the platform. This can be compared with the `lastLogin` date to see
    // which users have successfully accepted their invite.
    invited: {
      type: 'date'
    },

    // `getAvatar()` generates a hashed Gravatar URL at the requested size. This
    // is also available at `avatar` property of a user object when it is
    // encoded to JSON on a rendered route.
    getAvatar(size) {
      const hash = crypto.createHash('md5').update(this.email).digest('hex');
      return `//gravatar.com/avatar/${hash}.png?d=mm&s=${size || ''}`;
    },

    // `hasRole()` can be used to determine whether the user possesses a
    // required role in order to proceed in their request. This is mostly used
    // by `policies`.
    hasRole(roleName) {
      return (this.roles && this.roles.indexOf(roleName) >= 0);
    },

    // `loginSuccess()` is called when a user has completed login to update the
    // timestamp of the last time this user logged in.
    loginSuccess() {
      User.update(this.id, {
        lastLogin: new Date()
      }, err => sails.log.error(err));
    },

    // `toJSON()` is called by Sails whenever the user object is sent to a view.
    // A couple computed properties are appended to the user object including
    // `avatar` and `inviteCode`. Also, the encrypted user password is redacted.
    toJSON() {
      this.avatar = this.getAvatar(200);
      this.inviteCode = User.inviteCode(this.email);

      var obj = this.toObject();
      delete obj.password;
      return obj;
    }

  },

  /**
   * Helper method for updating values before they are created OR updated.
   * @param {Object} values The object being created or updated.
   * @param {Function} next Callback when finished.
   */
  beforeAll(values, next) {
    // E-mail is converted to lowercase at all times. This will prevent the
    // user login form from becoming case sensitive for the e-mail field.
    if (values.email) {
      values.email = values.email.trim().toLowerCase();
    }

    if (!values.password) {
      next();
      return;
    }

    // Encrypt the plain text password before it is stored in the database. See
    // [Machinepack-Passwords](http://node-machine.org/machinepack-passwords).
    Passwords.encryptPassword({ password: values.password }).exec({
      error: next,
      success: password => {
        values.password = password;
        next();
      }
    });
  },

  /**
   * Called by Waterline before a newly created object is saved to the database.
   * @param {Object} values The object being created.
   * @param {Function} next Callback when finished.
   */
  beforeCreate(values, next) {
    // If the user object being created does not include a password, one is
    // automatically generated for them using an invite code from their UID.
    if (!values.password || values.password === '') {
      values.password = User.inviteCode(values.email);
    }

    this.beforeAll(values, next);
  },

  /**
   * Called by Waterline before an existing object is updated in the database.
   * @param {Object} values The object being updated.
   * @param {Function} next Callback when finished.
   */
  beforeUpdate: function(values, next) {
    this.beforeAll(values, next);
  },

  /**
   * A new user can have their password temporarily set to this invite code
   * which is generated off their e-mail address. This allows for a single-click
   * login experience when first interacting with the platform and requires the
   * user to change their password immediately.
   * @param {String} email The user's e-mail address.
   * @return {String} The invite code for this user.
   */
  inviteCode(email) {
    return new Buffer(email).toString('base64').replace('+', '-').replace('/', '_');
  }

};
