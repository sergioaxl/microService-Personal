const AppError = require('./Error');

const MAX_INT = 2147483647; 

const parseId = (valor, campo = 'id') => {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) {
        throw new AppError(`El campo ${campo} debe ser un número entero positivo`, 400);
    }
    return id;
};

// A diferencia de parseId (para llaves primarias de la BD, que aquí siempre
// empiezan en 1), id_huella es la posición del sensor de huellas y los
// lectores ópticos comunes (R307/AS608/FPM10A) numeran esas posiciones desde
// el 0, así que 0 es un valor válido.
const parseEnteroNoNegativo = (valor, campo = 'valor') => {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 0 || n > MAX_INT) {
        throw new AppError(`El campo ${campo} debe ser un número entero mayor o igual a 0`, 400);
    }
    return n;
};

const textoRequerido = (valor, campo, max) => {
    if (typeof valor !== 'string' || valor.trim() === '') {
        throw new AppError(`El campo ${campo} es obligatorio`, 400);
    }
    const limpio = valor.trim();
    if (limpio.length > max) {
        throw new AppError(`El campo ${campo} no puede exceder ${max} caracteres`, 400);
    }
    return limpio;
};

const textoOpcional = (valor, campo, max) => {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor !== 'string') {
        throw new AppError(`El campo ${campo} debe ser texto`, 400);
    }
    const limpio = valor.trim();
    if (limpio === '') return null;
    if (limpio.length > max) {
        throw new AppError(`El campo ${campo} no puede exceder ${max} caracteres`, 400);
    }
    return limpio;
};

const MAX_PAGE = 1000000;
const parsePaginacion = (query = {}, limiteMax = 100, limiteDefault = 20) => {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? limiteDefault : Number(query.limit);

    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
        throw new AppError('El parámetro page debe ser un número entero positivo', 400);
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > limiteMax) {
        throw new AppError(`El parámetro limit debe ser un entero entre 1 y ${limiteMax}`, 400);
    }
    return { page, limit, offset: (page - 1) * limit };
};

const armarPaginacion = ({ page, limit }, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
});

const parseBusqueda = (valor, campo = 'q', max = 100) => {
    if (valor === undefined) return null;
    if (typeof valor !== 'string') {
        throw new AppError(`El parámetro ${campo} debe ser texto`, 400);
    }
    const limpio = valor.trim();
    if (limpio === '') return null;
    if (limpio.length > max) {
        throw new AppError(`El parámetro ${campo} no puede exceder ${max} caracteres`, 400);
    }
    return limpio;
};

module.exports = { parseId, parseEnteroNoNegativo, textoRequerido, textoOpcional, parsePaginacion, armarPaginacion, parseBusqueda };
