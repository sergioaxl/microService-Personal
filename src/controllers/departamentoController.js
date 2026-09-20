const departamentoService = require('../services/departamentoService');
const catchAsync = require('../utils/catchAsync');

exports.crearDepartamento = catchAsync(async (req, res, next) => {
    const departamento = await departamentoService.crear(req.body ?? {});

    res.status(201).json({
        status: 'success',
        data: { departamento }
    });
});

exports.listarDepartamentos = catchAsync(async (req, res, next) => {
    const departamentos = await departamentoService.listar();

    res.status(200).json({
        status: 'success',
        results: departamentos.length,
        data: { departamentos }
    });
});

exports.obtenerDepartamento = catchAsync(async (req, res, next) => {
    const departamento = await departamentoService.obtener(req.params.id);

    res.status(200).json({
        status: 'success',
        data: { departamento }
    });
});

exports.actualizarDepartamento = catchAsync(async (req, res, next) => {
    const departamento = await departamentoService.actualizar(req.params.id, req.body ?? {});

    res.status(200).json({
        status: 'success',
        data: { departamento }
    });
});

exports.eliminarDepartamento = catchAsync(async (req, res, next) => {
    await departamentoService.eliminar(req.params.id);

    res.status(204).send();
});
