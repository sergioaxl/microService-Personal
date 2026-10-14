const personalRepository = require('../repository/personalRepository');
const departamentoRepository = require('../repository/departamentoRepository');
const AppError = require('../utils/Error');
const {
    parseId, parseEnteroNoNegativo, textoRequerido, textoOpcional,
    parsePaginacion, armarPaginacion, parseBusqueda
} = require('../utils/validators');

const ESTADOS = ['activo', 'inactivo'];

class PersonalService {
    // id_huella ya NO se recibe ni se valida aquí: se reserva
    // automáticamente en el repositorio al registrar (RF-10, con huella digital).
    async validarDatos(datos) {
        const limpio = {
            nombre: textoRequerido(datos.nombre, 'nombre', 50),
            apellido_paterno: textoRequerido(datos.apellido_paterno, 'apellido_paterno', 50),
            apellido_materno: textoOpcional(datos.apellido_materno, 'apellido_materno', 50),
            departamento_id: parseId(datos.departamento_id, 'departamento_id'),
            fotografia_url: textoOpcional(datos.fotografia_url, 'fotografia_url', 255),
        };

        const departamento = await departamentoRepository.buscarPorId(limpio.departamento_id);
        if (!departamento) {
            throw new AppError('El departamento indicado no existe', 400);
        }
        return limpio;
    }

    async registrarPersonal(datos) {
        const limpio = await this.validarDatos(datos);
        return personalRepository.crear(limpio);
    }

    // Devuelve { personal, pagination }
    async listarPersonal(filtros = {}) {
        const paginacion = parsePaginacion(filtros);
        const consulta = {
            limit: paginacion.limit,
            offset: paginacion.offset,
            busqueda: parseBusqueda(filtros.q)
        };

        if (filtros.estado !== undefined) {
            if (!ESTADOS.includes(filtros.estado)) {
                throw new AppError('Estado no válido. Debe ser activo o inactivo', 400);
            }
            consulta.estado = filtros.estado;
        }
        if (filtros.departamento_id !== undefined) {
            consulta.departamento_id = parseId(filtros.departamento_id, 'departamento_id');
        }

        const { filas, total } = await personalRepository.listar(consulta);
        return { personal: filas, pagination: armarPaginacion(paginacion, total) };
    }

    async obtenerPorIdHuella(idHuella) {
        const limpio = parseEnteroNoNegativo(idHuella, 'id_huella');
        const empleado = await personalRepository.buscarPorIdHuella(limpio);
        if (!empleado) {
            throw new AppError('No existe personal con esa huella registrada', 404);
        }
        return empleado;
    }

    async obtenerPersonal(id) {
        const empleado = await personalRepository.buscarPorId(parseId(id));
        if (!empleado) {
            throw new AppError('Empleado no encontrado', 404);
        }
        return empleado;
    }

    async actualizarPersonal(id, datos) {
        const idNum = parseId(id);
        const limpio = await this.validarDatos(datos);

        const empleado = await personalRepository.buscarPorId(idNum);
        if (!empleado) {
            throw new AppError('Empleado no encontrado', 404);
        }

        return personalRepository.actualizar(idNum, limpio);
    }

    // Baja logica: NO se borra el registro, se marca como inactivo.
    // Asi el historial de accesos (que referencia a esta persona) nunca queda huerfano.
    async eliminarPersonal(id) {
        const dado = await personalRepository.actualizarEstado(parseId(id), 'inactivo');
        if (!dado) {
            throw new AppError('Empleado no encontrado', 404);
        }
    }

    // Confirma que la huella física ya se capturó en el sensor (la posición
    // id_huella ya se había reservado desde que se registró a la persona).
    async confirmarHuella(id) {
        const idNum = parseId(id);
        const empleado = await personalRepository.buscarPorId(idNum);
        if (!empleado) {
            throw new AppError('Empleado no encontrado', 404);
        }
        if (empleado.huella_registrada) {
            throw new AppError('Esta persona ya tiene la huella registrada', 400);
        }
        return personalRepository.marcarHuellaRegistrada(idNum);
    }

    async cambiarEstadoPersonal(id, estado) {
        const idNum = parseId(id);
        if (!ESTADOS.includes(estado)) {
            throw new AppError('Estado no válido. Debe ser activo o inactivo', 400);
        }

        const empleado = await personalRepository.buscarPorId(idNum);
        if (!empleado) {
            throw new AppError('Empleado no encontrado', 404);
        }
        await personalRepository.actualizarEstado(idNum, estado);
        return { mensaje: `El estado del personal se actualizó a ${estado}` };
    }
}

module.exports = new PersonalService();