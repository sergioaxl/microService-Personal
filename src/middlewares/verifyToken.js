const jwt = require('jsonwebtoken');

// Debe usar el mismo JWT_SECRET que MicroService_Autenticacion (variable
// de entorno JWT_SECRET en el .env de este servicio) para poder validar
// los tokens que emite ese microservicio.
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'Token invalido o expirado' });
        }
        req.admin = decoded;
        next();
    });
};

module.exports = verifyToken;
