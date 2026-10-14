const pool = require('../config/database');

class PersonalRepository {
    // Reserva un número de posición para el lector de huellas, a partir de
    // la secuencia de la BD: nunca se repite, ni con inserciones simultáneas,
    // así que no hace falta reintentar por choque. El número que entrega es
    // el que luego se usará como PageID/slot al capturar la huella física en
    // el sensor (comando "Store" de la mayoría de lectores R30x/AS608).
    async obtenerSiguienteIdHuella() {
        const result = await pool.query(`SELECT nextval('personal_id_huella_seq') AS n`);
        return result.rows[0].n;
    }

    async crear({ nombre, apellido_paterno, apellido_materno, departamento_id, fotografia_url }) {
        const id_huella = await this.obtenerSiguienteIdHuella();
        const result = await pool.query(
            `INSERT INTO personal (nombre, apellido_paterno, apellido_materno, id_huella, departamento_id, fotografia_url)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, apellido_paterno, apellido_materno, id_huella, departamento_id, fotografia_url]
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
                  OR p.id_huella::text ILIKE $${n})`
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

    async buscarPorIdHuella(id_huella) {
        const result = await pool.query(
            `SELECT p.*, d.nombre AS departamento
             FROM personal p
             JOIN departamentos d ON d.id = p.departamento_id
             WHERE p.id_huella = $1`,
            [id_huella]
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

    // id_huella NO se actualiza aquí: se reserva una sola vez al crear el
    // registro y queda fija (es la posición donde ya pudo haberse grabado la
    // huella física en el sensor).
    async actualizar(id, { nombre, apellido_paterno, apellido_materno, departamento_id, fotografia_url }) {
        const result = await pool.query(
            `UPDATE personal
             SET nombre = $1, apellido_paterno = $2, apellido_materno = $3,
                 departamento_id = $4, fotografia_url = $5
             WHERE id = $6 RETURNING *`,
            [nombre, apellido_paterno, apellido_materno, departamento_id, fotografia_url, id]
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

    // Marca que la huella física YA se capturó en el sensor en la posición
    // id_huella de esta persona. Lo llama la app/estación de enrolamiento
    // después de que el sensor confirma el comando "Store".
    async marcarHuellaRegistrada(id) {
        const result = await pool.query(
            'UPDATE personal SET huella_registrada = true WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = new PersonalRepository();
