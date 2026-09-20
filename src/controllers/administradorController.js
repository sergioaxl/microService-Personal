const administradorService = require('../services/administradorService');
const catchAsync = require('../utils/catchAsync');

exports.registrarAdministrador = catchAsync(async (req, res, next) => {
    const administrador = await administradorService.registrar(req.body ?? {});

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

    res.status(200).json({
        status: 'success',
        data: { administrador }
    });
});

exports.cambiarPassword = catchAsync(async (req, res, next) => {
    const resultado = await administradorService.cambiarPassword(req.params.id, req.body ?? {});

    res.status(200).json({
        status: 'success',
        message: resultado.mensaje
    });
});

exports.eliminarAdministrador = catchAsync(async (req, res, next) => {
    await administradorService.eliminar(req.params.id);

    res.status(204).send();
});
