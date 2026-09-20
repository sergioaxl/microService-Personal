const pool = require('../config/database');

class DepartamentoRepository {
    async crear({ nombre, descripcion }) {
        const result = await pool.query(
            'INSERT INTO departamentos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion]
        );
        return result.rows[0];
    }

    async listar() {
        const result = await pool.query('SELECT * FROM departamentos ORDER BY nombre');
        return result.rows;
    }

    async buscarPorId(id) {
        const result = await pool.query('SELECT * FROM departamentos WHERE id = $1', [id]);
        return result.rows[0];
    }

    async buscarPorNombre(nombre) {
        const result = await pool.query('SELECT * FROM departamentos WHERE nombre = $1', [nombre]);
        return result.rows[0];
    }

    async actualizar(id, { nombre, descripcion }) {
        const result = await pool.query(
            'UPDATE departamentos SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
            [nombre, descripcion, id]
        );
        return result.rows[0];
    }

    async eliminar(id) {
        const result = await pool.query('DELETE FROM departamentos WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = new DepartamentoRepository();
