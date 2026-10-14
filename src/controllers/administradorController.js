const administradorService = require('../services/administradorService');
const { auditar } = require('../utils/auditoria');
const catchAsync = require('../utils/catchAsync');

exports.registrarAdministrador = catchAsync(async (req, res, next) => {
    const administrador = await administradorService.registrar(req.body ?? {});
    auditar(req, 'personal', { accion: 'ADMIN_CREADO', entidad: 'admin', entidad_id: administrador?.id, detalle: { usuario: administrador?.usuario } });

    res.status(201).json({
        status: 'success',
        data: { administrador }
    });
});

exports.listarAdministradores = catchAsync(async (req, res, next) => {
    const { administradores, pagination } = await administradorService.listar(req.query);

    res.status(200).json({
        status: 'success',
        results: administradores.length,
        pagination,
        data: { administradores }
    });
});

exports.obtenerAdministrador = catchAsync(async (req, res, next) => {
    const administrador = await administradorService.obtener(req.params.id);

    res.status(200).json({
        status: 'success',
        data: { administrador }
    });
});

exports.actualizarAdministrador = catchAsync(async (req, res, next) => {
    const administrador = await administradorService.actualizar(req.params.id, req.body ?? {});
    auditar(req, 'personal', { accion: 'ADMIN_ACTUALIZADO', entidad: 'admin', entidad_id: req.params.id, detalle: { usuario: administrador?.usuario } });

    res.status(200).json({
        status: 'success',
        data: { administrador }
    });
});

exports.cambiarPassword = catchAsync(async (req, res, next) => {
    const resultado = await administradorService.cambiarPassword(req.params.id, req.body ?? {});
    auditar(req, 'personal', { accion: 'ADMIN_PASSWORD_CAMBIADA', entidad: 'admin', entidad_id: req.params.id });

    res.status(200).json({
        status: 'success',
        message: resultado.mensaje
    });
});

exports.eliminarAdministrador = catchAsync(async (req, res, next) => {
    await administradorService.eliminar(req.params.id);
    auditar(req, 'personal', { accion: 'ADMIN_ELIMINADO', entidad: 'admin', entidad_id: req.params.id });

    res.status(204).send();
});
