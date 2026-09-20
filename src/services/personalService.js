const personalRepository = require('../repository/personalRepository');
const departamentoRepository = require('../repository/departamentoRepository');
const AppError = require('../utils/Error');
const {
    parseId, textoRequerido, textoOpcional,
    parsePaginacion, armarPaginacion, parseBusqueda
} = require('../utils/validators');

const ESTADOS = ['activo', 'inactivo'];

class PersonalService {
    async validarDatos(datos) {
        const limpio = {
            nombre: textoRequerido(datos.nombre, 'nombre', 50),
            apellido_paterno: textoRequerido(datos.apellido_paterno, 'apellido_paterno', 50),
            apellido_materno: textoOpcional(datos.apellido_materno, 'apellido_materno', 50),
            codigo_barras: textoRequerido(datos.codigo_barras, 'codigo_barras', 100),
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

        const existeCodigo = await personalRepository.buscarPorCodigoBarras(limpio.codigo_barras);
        if (existeCodigo) {
            throw new AppError('El código de barras ya está asociado a otro empleado', 409);
        }

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

    async obtenerPorCodigoBarras(codigo) {
        const limpio = textoRequerido(codigo, 'codigo_barras', 100);
        const empleado = await personalRepository.buscarPorCodigoBarras(limpio);
        if (!empleado) {
            throw new AppError('No existe personal con ese código de barras', 404);
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

        const otro = await personalRepository.buscarPorCodigoBarras(limpio.codigo_barras);
        if (otro && otro.id !== idNum) {
            throw new AppError('El código de barras ya está asociado a otro empleado', 409);
        }

        return personalRepository.actualizar(idNum, limpio);
    }

    async eliminarPersonal(id) {
        const eliminado = await personalRepository.eliminar(parseId(id));
        if (!eliminado) {
            throw new AppError('Empleado no encontrado', 404);
        }
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
