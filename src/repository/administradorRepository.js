const pool = require('../config/database');

const COLUMNAS_PUBLICAS = 'id, usuario, nombre_completo, correo, creado_en';

class AdministradorRepository {
    async crear({ usuario, password_hash, nombre_completo, correo }) {
        const result = await pool.query(
            `INSERT INTO administradores (usuario, password_hash, nombre_completo, correo)
             VALUES ($1, $2, $3, $4) RETURNING ${COLUMNAS_PUBLICAS}`,
            [usuario, password_hash, nombre_completo, correo]
        );
        return result.rows[0];
    }

    async listar({ limit, offset }) {
        const conteo = await pool.query('SELECT COUNT(*)::int AS total FROM administradores');
        const result = await pool.query(
            `SELECT ${COLUMNAS_PUBLICAS} FROM administradores ORDER BY id LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return { filas: result.rows, total: conteo.rows[0].total };
    }

    async buscarPorId(id) {
        const result = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM administradores WHERE id = $1`, [id]);
        return result.rows[0];
    }

    async buscarPorUsuario(usuario) {
        const result = await pool.query('SELECT * FROM administradores WHERE usuario = $1', [usuario]);
        return result.rows[0];
    }

    async buscarConHashPorId(id) {
        const result = await pool.query('SELECT * FROM administradores WHERE id = $1', [id]);
        return result.rows[0];
    }

    async buscarPorCorreo(correo) {
        const result = await pool.query('SELECT id FROM administradores WHERE correo = $1', [correo]);
        return result.rows[0];
    }

    async actualizar(id, { nombre_completo, correo }) {
        const result = await pool.query(
            `UPDATE administradores SET nombre_completo = $1, correo = $2
             WHERE id = $3 RETURNING ${COLUMNAS_PUBLICAS}`,
            [nombre_completo, correo, id]
        );
        return result.rows[0];
    }

    async actualizarPassword(id, password_hash) {
        const result = await pool.query(
            'UPDATE administradores SET password_hash = $1 WHERE id = $2',
            [password_hash, id]
        );
        return result.rowCount > 0;
    }

    async eliminarSiNoEsUltimo(id) {
        const result = await pool.query(
            `DELETE FROM administradores
             WHERE id = $1 AND (SELECT COUNT(*) FROM administradores) > 1`,
            [id]
        );
        return result.rowCount > 0;
    }
}

module.exports = new AdministradorRepository();
