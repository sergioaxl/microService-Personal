const pool = require('./database');

const SCHEMA = `
    -- Tabla de Departamentos
    CREATE TABLE IF NOT EXISTS departamentos (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre      VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de Personal / Empleados
    CREATE TABLE IF NOT EXISTS personal (
        id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre           VARCHAR(50)  NOT NULL,
        apellido_paterno VARCHAR(50)  NOT NULL,
        apellido_materno VARCHAR(50),
        codigo_barras    VARCHAR(100) NOT NULL UNIQUE,            -- RF-10: código de barras único
        departamento_id  INTEGER      NOT NULL
                         REFERENCES departamentos(id) ON DELETE RESTRICT,
        estado           VARCHAR(10)  NOT NULL DEFAULT 'activo'   -- RF-09: estado del personal
                         CHECK (estado IN ('activo', 'inactivo')),
        fotografia_url   VARCHAR(255),
        creado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de Administradores
    CREATE TABLE IF NOT EXISTS administradores (
        id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        usuario         VARCHAR(50)  NOT NULL UNIQUE,
        password_hash   VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(100) NOT NULL,
        correo          VARCHAR(100) NOT NULL UNIQUE,
        creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- MIGRACIÓN TEMPORAL: elimina la columna "rol" de la versión anterior.
    -- Puedes borrar estas dos líneas después de arrancar el servidor una vez.
    ALTER TABLE administradores DROP COLUMN IF EXISTS rol;

    -- Índices para los filtros del listado de personal
    CREATE INDEX IF NOT EXISTS idx_personal_departamento ON personal(departamento_id);
    CREATE INDEX IF NOT EXISTS idx_personal_estado       ON personal(estado);

    -- Equivalente a "ON UPDATE CURRENT_TIMESTAMP" de MySQL:
    -- PostgreSQL lo resuelve con un trigger.
    CREATE OR REPLACE FUNCTION set_actualizado_en()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.actualizado_en = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_personal_actualizado_en ON personal;
    CREATE TRIGGER trg_personal_actualizado_en
        BEFORE UPDATE ON personal
        FOR EACH ROW
        EXECUTE FUNCTION set_actualizado_en();
`;

const initDb = async () => {
    await pool.query(SCHEMA);
    console.log('Base de datos lista (departamentos, personal, administradores)');
};

module.exports = initDb;
