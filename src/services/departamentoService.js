const departamentoRepository = require('../repository/departamentoRepository');
const AppError = require('../utils/Error');
const { parseId, textoRequerido, textoOpcional } = require('../utils/validators');

class DepartamentoService {
    validarDatos(datos) {
        return {
            nombre: textoRequerido(datos.nombre, 'nombre', 100),
            descripcion: textoOpcional(datos.descripcion, 'descripcion', 1000),
        };
    }

    async crear(datos) {
        const limpio = this.validarDatos(datos);

        const existe = await departamentoRepository.buscarPorNombre(limpio.nombre);
        if (existe) {
            throw new AppError('Ya existe un departamento con ese nombre', 409);
        }
        return departamentoRepository.crear(limpio);
    }

    async listar() {
        return departamentoRepository.listar();
    }

    async obtener(id) {
        const departamento = await departamentoRepository.buscarPorId(parseId(id));
        if (!departamento) {
            throw new AppError('Departamento no encontrado', 404);
        }
        return departamento;
    }

    async actualizar(id, datos) {
        const idNum = parseId(id);
        const limpio = this.validarDatos(datos);

        const actual = await departamentoRepository.buscarPorId(idNum);
        if (!actual) {
            throw new AppError('Departamento no encontrado', 404);
        }

        const otro = await departamentoRepository.buscarPorNombre(limpio.nombre);
        if (otro && otro.id !== idNum) {
            throw new AppError('Ya existe un departamento con ese nombre', 409);
        }
        return departamentoRepository.actualizar(idNum, limpio);
    }

    async eliminar(id) {
        const idNum = parseId(id);
        let eliminado;
        try {
            eliminado = await departamentoRepository.eliminar(idNum);
        } catch (err) {
            if (err.code === '23503') {
                throw new AppError('No se puede eliminar: el departamento tiene personal asignado', 409);
            }
            throw err;
        }
        if (!eliminado) {
            throw new AppError('Departamento no encontrado', 404);
        }
    }
}

module.exports = new DepartamentoService();
