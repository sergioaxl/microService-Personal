// Hash de contraseñas con scrypt (incluido en Node, sin dependencias extra).
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LEN = 64;

exports.hashPassword = async (password) => {
    const salt = crypto.randomBytes(16);
    const derived = await scrypt(password, salt, KEY_LEN);
    return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
};

exports.verifyPassword = async (password, almacenado) => {
    const [algoritmo, saltHex, hashHex] = String(almacenado).split('$');
    if (algoritmo !== 'scrypt' || !saltHex || !hashHex) return false;

    const esperado = Buffer.from(hashHex, 'hex');
    const derived = await scrypt(password, Buffer.from(saltHex, 'hex'), esperado.length);
    return crypto.timingSafeEqual(derived, esperado);
};
