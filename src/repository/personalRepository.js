const pool = require('../config/database');

class PersonalRepository {
    async crear({ nombre, apellido_paterno, apellido_materno, codigo_barras, departamento_id, fotografia_url }) {
        const result = await pool.query(
            `INSERT INTO personal (nombre, apellido_paterno, apellido_materno, codigo_barras, departamento_id, fotografia_url)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, apellido_paterno, apellido_materno, codigo_barras, departamento_id, fotografia_url]
        );
        return result.rows[0];
    }

    async listar({ estado, departamento_id, busqueda, limit, offset } = {}) {
        const condiciones = [];
        const valores = [];

        if (estado) {
            valores.push(estado);
            condiciones.push(`p.estado = $${valores.length}`);
        }
        if (departamento_id) {
            valores.push(departamento_id);
            condiciones.push(`p.departamento_id = $${valores.length}`);
        }
        if (busqueda) {
            valores.push(`%${busqueda.replace(/[\\%_]/g, '\\$&')}%`);
            const n = valores.length;
            condiciones.push(
                `((p.nombre || ' ' || p.apellido_paterno || ' ' || COALESCE(p.apellido_materno, '')) ILIKE $${n}
                  OR p.codigo_barras ILIKE $${n})`
            );
        }
        const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

        const conteo = await pool.query(
            `SELECT COUNT(*)::int AS total FROM personal p ${where}`,
            valores
        );

        const result = await pool.query(
            `SELECT p.*, d.nombre AS departamento
             FROM personal p
             JOIN departamentos d ON d.id = p.departamento_id
             ${where}
             ORDER BY p.id
             LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`,
            [...valores, limit, offset]
        );
        return { filas: result.rows, total: conteo.rows[0].total };
    }

    async buscarPorCodigoBarras(codigo) {
        const result = await pool.query(
            `SELECT p.*, d.nombre AS departamento
             FROM personal p
             JOIN departamentos d ON d.id = p.departamento_id
             WHERE p.codigo_barras = $1`,
            [codigo]
        );
        return result.rows[0];
    }

    async buscarPorId(id) {
        const result = await pool.query(
            `SELECT p.*, d.nombre AS departamento
             FROM personal p
             JOIN departamentos d ON d.id = p.departamento_id
             WHERE p.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async actualizar(id, { nombre, apellido_paterno, apellido_materno, codigo_barras, departamento_id, fotografia_url }) {
        const result = await pool.query(
            `UPDATE personal
             SET nombre = $1, apellido_paterno = $2, apellido_materno = $3,
                 codigo_barras = $4, departamento_id = $5, fotografia_url = $6
             WHERE id = $7 RETURNING *`,
            [nombre, apellido_paterno, apellido_materno, codigo_barras, departamento_id, fotografia_url, id]
        );
        return result.rows[0];
    }

    async eliminar(id) {
        const result = await pool.query('DELETE FROM personal WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    async actualizarEstado(id, estado) {
        const result = await pool.query('UPDATE personal SET estado = $1 WHERE id = $2', [estado, id]);
        return result.rowCount > 0;
    }
}

module.exports = new PersonalRepository();
