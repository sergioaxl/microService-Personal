const personalService = require('../services/personalService');
const catchAsync = require('../utils/catchAsync'); 

exports.registrarPersonal = catchAsync(async (req, res, next) => {
    const nuevoPersonal = await personalService.registrarPersonal(req.body ?? {});
    
    res.status(201).json({
        status: 'success',
        data: {
            personal: nuevoPersonal
        }
    });
});

exports.listarPersonal = catchAsync(async (req, res, next) => {
    const { personal, pagination } = await personalService.listarPersonal(req.query);

    res.status(200).json({
        status: 'success',
        results: personal.length,
        pagination,
        data: { personal }
    });
});

exports.obtenerPorCodigoBarras = catchAsync(async (req, res, next) => {
    const personal = await personalService.obtenerPorCodigoBarras(req.params.codigo);

    res.status(200).json({
        status: 'success',
        data: { personal }
    });
});

exports.obtenerPersonal = catchAsync(async (req, res, next) => {
    const personal = await personalService.obtenerPersonal(req.params.id);

    res.status(200).json({
        status: 'success',
        data: { personal }
    });
});

exports.actualizarPersonal = catchAsync(async (req, res, next) => {
    const personal = await personalService.actualizarPersonal(req.params.id, req.body ?? {});

    res.status(200).json({
        status: 'success',
        data: { personal }
    });
});

exports.eliminarPersonal = catchAsync(async (req, res, next) => {
    await personalService.eliminarPersonal(req.params.id);

    res.status(204).send();
});

exports.cambiarEstado = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { estado } = req.body ?? {};

    const resultado = await personalService.cambiarEstadoPersonal(id, estado);

    res.status(200).json({
        status: 'success',
        message: resultado.mensaje
    });
});
