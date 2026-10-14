const departamentoService = require('../services/departamentoService');
const { auditar } = require('../utils/auditoria');
const catchAsync = require('../utils/catchAsync');

exports.crearDepartamento = catchAsync(async (req, res, next) => {
    const departamento = await departamentoService.crear(req.body ?? {});
    auditar(req, 'personal', { accion: 'DEPARTAMENTO_CREADO', entidad: 'departamento', entidad_id: departamento?.id, detalle: { nombre: departamento?.nombre } });

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
    auditar(req, 'personal', { accion: 'DEPARTAMENTO_ACTUALIZADO', entidad: 'departamento', entidad_id: req.params.id, detalle: { despues: { nombre: departamento?.nombre } } });

    res.status(200).json({
        status: 'success',
        data: { departamento }
    });
});

exports.eliminarDepartamento = catchAsync(async (req, res, next) => {
    await departamentoService.eliminar(req.params.id);
    auditar(req, 'personal', { accion: 'DEPARTAMENTO_ELIMINADO', entidad: 'departamento', entidad_id: req.params.id });

    res.status(204).send();
});
