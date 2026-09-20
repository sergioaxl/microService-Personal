const express = require('express');
const cors = require('cors');
const personalRoutes = require('./routes/personalRoutes');
const departamentoRoutes = require('./routes/departamentoRoutes');
const administradorRoutes = require('./routes/administradorRoutes');
const AppError = require('./utils/Error');
const pool = require('./config/database');
const securityHeaders = require('./middlewares/securityHeaders');

const app = express();

app.disable('x-powered-by'); // no anunciar que es Express

// CORS_ORIGINS="https://mi-front.com,https://otro.com" -> solo esos orígenes.
// Sin definir: en producción se bloquea el acceso desde navegadores de otros orígenes;
// en desarrollo se permite todo.
const origenesPermitidos = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: origenesPermitidos.length > 0
        ? origenesPermitidos
        : process.env.NODE_ENV !== 'production'
}));
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));

// Para monitoreo / balanceadores: confirma que el servicio y la BD responden
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        res.status(503).json({ status: 'error', message: 'Base de datos no disponible' });
    }
});

app.use('/api/v1/personal', personalRoutes);
app.use('/api/v1/departamentos', departamentoRoutes);
app.use('/api/v1/administradores', administradorRoutes);

app.use((req, res, next) => {
    next(new AppError(`No se puede encontrar la ruta ${req.originalUrl} en este servidor.`, 404));
});

app.use((err, req, res, next) => {
    // Errores conocidos de PostgreSQL y del parser de JSON -> respuestas claras
    if (err.code === '23505') {          // unique_violation (p. ej. dos peticiones simultáneas)
        err = new AppError('Ya existe un registro con ese valor único', 409);
    } else if (err.code === '23503') {   // foreign_key_violation
        err = new AppError('La operación viola una relación con otro registro', 409);
    } else if (err.type === 'entity.parse.failed') {
        err = new AppError('El cuerpo de la petición no es un JSON válido', 400);
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (!err.isOperational) {
        console.error(err);
    }

    // En producción no se exponen mensajes internos (p. ej. errores de la BD)
    const mostrarMensaje = err.isOperational || process.env.NODE_ENV !== 'production';

    res.status(err.statusCode).json({
        status: err.status,
        message: mostrarMensaje ? err.message : 'Error interno del servidor'
    });
});

module.exports = app;
