const pool = require('./database');

const SCHEMA = `
    -- Tabla de Departamentos
    CREATE TABLE IF NOT EXISTS departamentos (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre      VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Secuencia usada para reservar un número de "slot" de huella (id_huella)
    -- de forma automática y garantizada única (sin colisiones, sin reintentos):
    -- cada llamada a nextval() entrega un número distinto, incluso con
    -- inserciones concurrentes. Empieza en 0 porque los lectores ópticos
    -- típicos (R307/AS608/FPM10A y compatibles) numeran sus posiciones de
    -- memoria interna desde 0.
    CREATE SEQUENCE IF NOT EXISTS personal_id_huella_seq START WITH 0 MINVALUE 0 INCREMENT BY 1;

    -- Tabla de Personal / Empleados
    CREATE TABLE IF NOT EXISTS personal (
        id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre             VARCHAR(50)  NOT NULL,
        apellido_paterno   VARCHAR(50)  NOT NULL,
        apellido_materno   VARCHAR(50),
        -- RF-10 (actualizado): en vez de código de barras, cada persona tiene un
        -- número de posición reservado en el lector de huellas. Se asigna solo
        -- (igual que antes el código de barras); "huella_registrada" indica si
        -- ya se capturó de verdad la huella física en esa posición del sensor.
        id_huella          INTEGER      NOT NULL UNIQUE,
        huella_registrada  BOOLEAN      NOT NULL DEFAULT false,
        departamento_id    INTEGER      NOT NULL
                           REFERENCES departamentos(id) ON DELETE RESTRICT,
        estado             VARCHAR(10)  NOT NULL DEFAULT 'activo'   -- RF-09: estado del personal
                           CHECK (estado IN ('activo', 'inactivo')),
        fotografia_url     VARCHAR(255),
        creado_en          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- MIGRACIÓN TEMPORAL: de código de barras a huella digital.
    -- Puedes borrar este bloque después de arrancar el servidor una vez.
    ALTER TABLE personal ADD COLUMN IF NOT EXISTS id_huella INTEGER;
    ALTER TABLE personal ADD COLUMN IF NOT EXISTS huella_registrada BOOLEAN NOT NULL DEFAULT false;
    -- A cualquier registro previo (de la época del código de barras) que no
    -- tenga id_huella se le reserva uno, para poder poner la columna en NOT NULL.
    UPDATE personal SET id_huella = nextval('personal_id_huella_seq') WHERE id_huella IS NULL;
    ALTER TABLE personal ALTER COLUMN id_huella SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_id_huella ON personal(id_huella);
    ALTER TABLE personal DROP COLUMN IF EXISTS codigo_barras;
    DROP SEQUENCE IF EXISTS personal_codigo_barras_seq;

    -- Tabla de Administradores
    CREATE TABLE IF NOT EXISTS administradores (
        id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        usuario          VARCHAR(50)  NOT NULL UNIQUE,
        password_hash    VARCHAR(255) NOT NULL,
        nombre           VARCHAR(50)  NOT NULL,
        apellido_paterno VARCHAR(50)  NOT NULL,
        apellido_materno VARCHAR(50),
        correo           VARCHAR(100) NOT NULL UNIQUE,
        creado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- MIGRACIÓN TEMPORAL: elimina la columna "rol" de la versión anterior.
    -- Puedes borrar estas dos líneas después de arrancar el servidor una vez.
    ALTER TABLE administradores DROP COLUMN IF EXISTS rol;

    -- MIGRACIÓN TEMPORAL: separa nombre_completo en nombre / apellido_paterno / apellido_materno.
    -- Los administradores existentes quedarán con estos campos en NULL/vacío; actualízalos a mano.
    -- Puedes borrar estas líneas después de arrancar el servidor una vez.
    ALTER TABLE administradores ADD COLUMN IF NOT EXISTS nombre VARCHAR(50);
    ALTER TABLE administradores ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(50);
    ALTER TABLE administradores ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(50);
    ALTER TABLE administradores DROP COLUMN IF EXISTS nombre_completo;

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