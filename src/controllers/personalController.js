const personalService = require('../services/personalService');
const { auditar } = require('../utils/auditoria');
const catchAsync = require('../utils/catchAsync'); 

exports.registrarPersonal = catchAsync(async (req, res, next) => {
    const nuevoPersonal = await personalService.registrarPersonal(req.body ?? {});
    auditar(req, 'personal', { accion: 'PERSONAL_CREADO', entidad: 'personal', entidad_id: nuevoPersonal?.id,
        detalle: { nombre: nuevoPersonal?.nombre, apellido_paterno: nuevoPersonal?.apellido_paterno,
                   departamento_id: nuevoPersonal?.departamento_id, id_huella: nuevoPersonal?.id_huella } });
    
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

exports.obtenerPorIdHuella = catchAsync(async (req, res, next) => {
    const personal = await personalService.obtenerPorIdHuella(req.params.id);

    res.status(200).json({
        status: 'success',
        data: { personal }
    });
});

exports.confirmarHuella = catchAsync(async (req, res, next) => {
    const personal = await personalService.confirmarHuella(req.params.id);
    auditar(req, 'personal', { accion: 'HUELLA_REGISTRADA', entidad: 'personal', entidad_id: req.params.id,
        detalle: { id_huella: personal?.id_huella } });

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
    auditar(req, 'personal', { accion: 'PERSONAL_ACTUALIZADO', entidad: 'personal', entidad_id: req.params.id,
        detalle: { despues: { nombre: personal?.nombre, apellido_paterno: personal?.apellido_paterno,
                              apellido_materno: personal?.apellido_materno, departamento_id: personal?.departamento_id } } });

    res.status(200).json({
        status: 'success',
        data: { personal }
    });
});

exports.eliminarPersonal = catchAsync(async (req, res, next) => {
    await personalService.eliminarPersonal(req.params.id);
    auditar(req, 'personal', { accion: 'PERSONAL_ELIMINADO', entidad: 'personal', entidad_id: req.params.id });

    res.status(204).send();
});

exports.cambiarEstado = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { estado } = req.body ?? {};

    const resultado = await personalService.cambiarEstadoPersonal(id, estado);
    auditar(req, 'personal', { accion: 'PERSONAL_ESTADO_CAMBIADO', entidad: 'personal', entidad_id: id, detalle: { estado } });

    res.status(200).json({
        status: 'success',
        message: resultado.mensaje
    });
});
