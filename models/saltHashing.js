'use strict';
var crypto = require('crypto');

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
function sha512(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

//This function returns the hashed password which is hashed using the salt.
function saltHashPassword(salt ,userpassword) {
    var passwordData = sha512(userpassword, salt);
    return passwordData.passwordHash;
}
module.exports={
 saltHashPassword: saltHashPassword,
 sha512:sha512,
 genRandomString: genRandomString
};