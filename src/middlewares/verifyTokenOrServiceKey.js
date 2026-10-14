const crypto = require('crypto');
const verifyToken = require('./verifyToken');

// Compara dos textos en tiempo constante (evita ataques por tiempo de respuesta).
const igual = (a, b) => {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
};

// Acepta DOS tipos de llamador:
//   1) Otro microservicio (p. ej. Accesos): header  x-service-key: <SERVICE_API_KEY>
//   2) Un administrador con sesion: header  Authorization: Bearer <JWT>
// Si SERVICE_API_KEY no esta definida en el .env, la via de servicio queda
// deshabilitada y solo entran los JWT de administrador (falla cerrado).
const verifyTokenOrServiceKey = (req, res, next) => {
    const llave = req.headers['x-service-key'];
    const esperada = process.env.SERVICE_API_KEY;

    if (llave && esperada) {
        if (igual(llave, esperada)) {
            req.servicio = true;
            return next();
        }
        return res.status(403).json({ status: 'error', message: 'Llave de servicio invalida' });
    }

    return verifyToken(req, res, next);
};

module.exports = verifyTokenOrServiceKey;
