const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config').get('jwt');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 * @param {*} password - The plain text password
 * @param {*} hash - The hash include salt stored in the database
 *
 * This function uses bcrypt library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

/**
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt with hash are stored for security
 */
function genPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
}

/**
 * @param {*} code - Set the JWT `sub` payload property to the user ID
 */

function issueJWT(code) {
    const expiresIn = config.expiresIn || '7d';
    const payload = {
        sub: code,
    };

    const signedToken = jsonwebtoken.sign(payload, process.env.JWT_SECRET || config.jwtSecret, {
        expiresIn: expiresIn,
        // algorithm: 'RS256',
    });

    return {
        token: signedToken,
        expires: expiresIn,
    };
}


module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
