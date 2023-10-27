const { sign } = require('jsonwebtoken');

function createToken(username, id) {
    return sign({ username, id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
        audience: 'fiap-auth'
    });
}

module.exports = {
    createToken
};