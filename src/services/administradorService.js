const administradorRepository = require('../repository/administradorRepository');
const AppError = require('../utils/Error');
const { parseId, textoRequerido, textoOpcional, parsePaginacion, armarPaginacion } = require('../utils/validators');
const { hashPassword, verifyPassword } = require('../utils/password');

const REGEX_USUARIO = /^[a-z0-9._-]{3,50}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validarUsuario = (valor) => {
    const usuario = textoRequerido(valor, 'usuario', 50).toLowerCase();
    if (!REGEX_USUARIO.test(usuario)) {
        throw new AppError('El usuario debe tener al menos 3 caracteres y solo puede contener letras, números, punto, guion y guion bajo', 400);
    }
    return usuario;
};

const validarCorreo = (valor) => {
    const correo = textoRequerido(valor, 'correo', 100).toLowerCase();
    if (!REGEX_CORREO.test(correo)) {
        throw new AppError('El correo no tiene un formato válido', 400);
    }
    return correo;
};

const validarPassword = (valor, campo) => {
    if (typeof valor !== 'string' || valor.length < 8) {
        throw new AppError(`El campo ${campo} debe tener al menos 8 caracteres`, 400);
    }
    if (valor.length > 128) {
        throw new AppError(`El campo ${campo} no puede exceder 128 caracteres`, 400);
    }
    return valor;
};

class AdministradorService {
    async registrar(datos) {
        const usuario = validarUsuario(datos.usuario);
        const password = validarPassword(datos.password, 'password');
        const nombre = textoRequerido(datos.nombre, 'nombre', 50);
        const apellido_paterno = textoRequerido(datos.apellido_paterno, 'apellido_paterno', 50);
        const apellido_materno = textoOpcional(datos.apellido_materno, 'apellido_materno', 50);
        const correo = validarCorreo(datos.correo);

        if (await administradorRepository.buscarPorUsuario(usuario)) {
            throw new AppError('El nombre de usuario ya está en uso', 409);
        }
        if (await administradorRepository.buscarPorCorreo(correo)) {
            throw new AppError('El correo ya está registrado', 409);
        }

        const password_hash = await hashPassword(password);
        return administradorRepository.crear({ usuario, password_hash, nombre, apellido_paterno, apellido_materno, correo });
    }

    // Devuelve { administradores, pagination }
    async listar(query = {}) {
        const paginacion = parsePaginacion(query);
        const { filas, total } = await administradorRepository.listar(paginacion);
        return { administradores: filas, pagination: armarPaginacion(paginacion, total) };
    }

    async obtener(id) {
        const admin = await administradorRepository.buscarPorId(parseId(id));
        if (!admin) {
            throw new AppError('Administrador no encontrado', 404);
        }
        return admin;
    }

    async actualizar(id, datos) {
        const idNum = parseId(id);
        const nombre = textoRequerido(datos.nombre, 'nombre', 50);
        const apellido_paterno = textoRequerido(datos.apellido_paterno, 'apellido_paterno', 50);
        const apellido_materno = textoOpcional(datos.apellido_materno, 'apellido_materno', 50);
        const correo = validarCorreo(datos.correo);

        const actual = await administradorRepository.buscarPorId(idNum);
        if (!actual) {
            throw new AppError('Administrador no encontrado', 404);
        }

        const otro = await administradorRepository.buscarPorCorreo(correo);
        if (otro && otro.id !== idNum) {
            throw new AppError('El correo ya está registrado', 409);
        }
        return administradorRepository.actualizar(idNum, { nombre, apellido_paterno, apellido_materno, correo });
    }

    async cambiarPassword(id, datos) {
        const idNum = parseId(id);
        const passwordNueva = validarPassword(datos.password_nueva, 'password_nueva');

        const admin = await administradorRepository.buscarConHashPorId(idNum);
        if (!admin) {
            throw new AppError('Administrador no encontrado', 404);
        }

        const coincide = typeof datos.password_actual === 'string'
            && await verifyPassword(datos.password_actual, admin.password_hash);
        if (!coincide) {
            throw new AppError('La contraseña actual es incorrecta', 401);
        }

        await administradorRepository.actualizarPassword(idNum, await hashPassword(passwordNueva));
        return { mensaje: 'Contraseña actualizada correctamente' };
    }

    async eliminar(id) {
        const idNum = parseId(id);

        const existe = await administradorRepository.buscarPorId(idNum);
        if (!existe) {
            throw new AppError('Administrador no encontrado', 404);
        }

        const eliminado = await administradorRepository.eliminarSiNoEsUltimo(idNum);
        if (!eliminado) {
            throw new AppError('No se puede eliminar al único administrador registrado', 409);
        }
    }
}

module.exports = new AdministradorService();
