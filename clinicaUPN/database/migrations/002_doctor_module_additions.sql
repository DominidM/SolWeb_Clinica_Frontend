-- =============================================================================
--  CLÍNICA UPN - MIGRACIÓN: Módulo DOCTOR + Seguridad + Recetas + Practicantes
--  PostgreSQL 16+  |  Compatible NestJS/Prisma/TypeORM
--  Ejecutar después del schema.sql base (MySQL → migrado a PostgreSQL)
-- =============================================================================
--  Uso:  psql -U <user> -d db_clinica_upn -f 002_doctor_module_additions.sql
-- =============================================================================

BEGIN;

-- =============================================================================
--  1. MÓDULO DE SEGURIDAD Y ROLES
-- =============================================================================

-- 1.1 Tabla catálogo de roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol      SERIAL PRIMARY KEY,
    nombre      VARCHAR(100)   NOT NULL UNIQUE,
    descripcion TEXT,
    estado      VARCHAR(20)    NOT NULL DEFAULT 'ACTIVO',
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Poblar roles del sistema
INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMINISTRADOR',  'Acceso total al sistema'),
    ('DIRECTOR',       'Visión ejecutiva y BI dashboard'),
    ('DOCTOR',         'Atención clínica y supervisión de practicantes'),
    ('MEDICO',         'Alias de DOCTOR para compatibilidad'),
    ('PRACTICANTE',    'Estudiante en prácticas pre-profesionales'),
    ('PACIENTE',       'Paciente / estudiante UPN'),
    ('ADMINISTRATIVO', 'Gestión de citas, pacientes y reportes')
ON CONFLICT (nombre) DO NOTHING;

-- 1.3 Tabla intermedia rol_modulo (permisos por módulo)
CREATE TABLE IF NOT EXISTS rol_modulo (
    id_rol_modulo SERIAL PRIMARY KEY,
    id_rol        INT      NOT NULL,
    id_modulo     INT      NOT NULL,
    puede_leer    BOOLEAN  NOT NULL DEFAULT TRUE,
    puede_crear   BOOLEAN  NOT NULL DEFAULT FALSE,
    puede_editar  BOOLEAN  NOT NULL DEFAULT FALSE,
    puede_eliminar BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rm_rol    FOREIGN KEY (id_rol)    REFERENCES roles(id_rol)        ON DELETE RESTRICT,
    CONSTRAINT fk_rm_modulo FOREIGN KEY (id_modulo) REFERENCES modulos_sistema(id_modulo) ON DELETE RESTRICT,
    CONSTRAINT uq_rol_modulo UNIQUE (id_rol, id_modulo)
);

-- 1.4 Agregar columna rol_id a usuarios (migración desde VARCHAR rol)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_rol INT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Migrar datos existentes: mapear VARCHAR → FK
DO $$
DECLARE
    v_rol_id INT;
BEGIN
    FOR v_rol_id IN SELECT DISTINCT id_rol FROM roles LOOP
        UPDATE usuarios
           SET id_rol = v_rol_id
         WHERE UPPER(rol) = (SELECT UPPER(nombre) FROM roles WHERE id_rol = v_rol_id)
           AND (id_rol IS NULL OR id_rol != v_rol_id);
    END LOOP;
END $$;

ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON usuarios(id_rol);

-- 1.5 Poblar permisos por defecto (DOCTOR)
INSERT INTO rol_modulo (id_rol, id_modulo, puede_leer, puede_crear, puede_editar, puede_eliminar)
SELECT r.id_rol, m.id_modulo, TRUE, TRUE, TRUE, FALSE
FROM roles r, modulos_sistema m
WHERE r.nombre = 'DOCTOR'
  AND m.nombre IN ('CITAS', 'HCE', 'PACIENTES', 'EXAMENES', 'TELECONSULTA', 'LOGS')
ON CONFLICT (id_rol, id_modulo) DO NOTHING;

INSERT INTO rol_modulo (id_rol, id_modulo, puede_leer, puede_crear, puede_editar, puede_eliminar)
SELECT r.id_rol, m.id_modulo, TRUE, FALSE, FALSE, FALSE
FROM roles r, modulos_sistema m
WHERE r.nombre = 'DOCTOR'
  AND m.nombre IN ('REPORTES', 'ESPECIALIDADES')
ON CONFLICT (id_rol, id_modulo) DO NOTHING;


-- =============================================================================
--  2. MÓDULO CLÍNICO — RECETAS Y DIAGNÓSTICOS
-- =============================================================================

-- 2.1 Catálogo de medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
    id_medicamento   SERIAL PRIMARY KEY,
    nombre_comercial VARCHAR(255) NOT NULL,
    nombre_generico  VARCHAR(255) NOT NULL,
    presentacion     VARCHAR(100) NOT NULL,
    estado           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_medicamento_nombre UNIQUE (nombre_comercial, presentacion)
);

-- 2.2 Recetas (cabecera)
CREATE TABLE IF NOT EXISTS recetas (
    id_receta           SERIAL PRIMARY KEY,
    consulta_id         INT          NOT NULL,
    fecha_emision       DATE         NOT NULL DEFAULT CURRENT_DATE,
    indicaciones_generales TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receta_consulta FOREIGN KEY (consulta_id)
        REFERENCES consultas(id_consulta) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recetas_consulta_id ON recetas(consulta_id);

-- 2.3 Detalle de receta (líneas de medicamentos)
CREATE TABLE IF NOT EXISTS detalle_receta (
    id_detalle      SERIAL PRIMARY KEY,
    receta_id       INT          NOT NULL,
    medicamento_id  INT          NOT NULL,
    dosis           VARCHAR(100) NOT NULL,
    frecuencia      VARCHAR(100) NOT NULL,
    duracion        VARCHAR(100) NOT NULL,
    via             VARCHAR(50)  DEFAULT 'Oral',
    indicaciones    TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_detalle_receta    FOREIGN KEY (receta_id)
        REFERENCES recetas(id_receta) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_medicamento FOREIGN KEY (medicamento_id)
        REFERENCES medicamentos(id_medicamento) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_detalle_receta_receta_id ON detalle_receta(receta_id);


-- =============================================================================
--  3. VINCULACIÓN DE PRACTICANTES (KPIs y supervisión)
-- =============================================================================

-- 3.1 Tabla de asignación: supervisor → practicantes supervisados
CREATE TABLE IF NOT EXISTS supervision_practicante (
    id_supervision   SERIAL PRIMARY KEY,
    id_supervisor    INT       NOT NULL,
    id_practicante   INT       NOT NULL,
    fecha_asignacion DATE      NOT NULL DEFAULT CURRENT_DATE,
    activo           BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_supervisor  FOREIGN KEY (id_supervisor)
        REFERENCES doctores(id_doctor) ON DELETE RESTRICT,
    CONSTRAINT fk_sp_practicante FOREIGN KEY (id_practicante)
        REFERENCES doctores(id_doctor) ON DELETE RESTRICT,
    CONSTRAINT uq_supervision UNIQUE (id_supervisor, id_practicante)
);

-- 3.2 La tabla consultas YA tiene id_practicante (ver schema.sql línea 72).
--     Solo aseguramos el FK si no existe aún.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_consulta_practicante'
          AND table_name = 'consultas'
    ) THEN
        ALTER TABLE consultas
            ADD CONSTRAINT fk_consulta_practicante
            FOREIGN KEY (id_practicante) REFERENCES doctores(id_doctor)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 3.3 La tabla evaluaciones_practicante YA tiene id_supervisor.
--     Agregamos evaluador_id como alias semántico (misma FK) más clara,
--     más columna id_consulta para vincular la evaluación a la consulta revisada.
ALTER TABLE evaluaciones_practicante
    ADD COLUMN IF NOT EXISTS evaluador_id INT;

ALTER TABLE evaluaciones_practicante
    ADD COLUMN IF NOT EXISTS consulta_id INT;

ALTER TABLE evaluaciones_practicante
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Migrar id_supervisor → evaluador_id (cuando sea NULL)
UPDATE evaluaciones_practicante
   SET evaluador_id = id_supervisor
 WHERE evaluador_id IS NULL;

-- Agregar FKs (solo si no existen)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_evaluacion_evaluador'
          AND table_name = 'evaluaciones_practicante'
    ) THEN
        ALTER TABLE evaluaciones_practicante
            ADD CONSTRAINT fk_evaluacion_evaluador
            FOREIGN KEY (evaluador_id) REFERENCES doctores(id_doctor)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_evaluacion_consulta'
          AND table_name = 'evaluaciones_practicante'
    ) THEN
        ALTER TABLE evaluaciones_practicante
            ADD CONSTRAINT fk_evaluacion_consulta
            FOREIGN KEY (consulta_id) REFERENCES consultas(id_consulta)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_eval_practicante_consulta ON evaluaciones_practicante(consulta_id);
CREATE INDEX IF NOT EXISTS idx_eval_practicante_evaluador ON evaluaciones_practicante(evaluador_id);


-- =============================================================================
--  4. TRIGGERS: updated_at automático (PostgreSQL no tiene ON UPDATE CURRENT_TIMESTAMP)
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas que tienen updated_at (solo si no existen)
DO $$
DECLARE
    tbl TEXT;
    tables_with_updated_at TEXT[] := ARRAY['roles', 'usuarios', 'consultas', 'examenes',
                                           'medicamentos', 'recetas', 'detalle_receta',
                                           'evaluaciones_practicante'];
BEGIN
    FOREACH tbl IN ARRAY tables_with_updated_at LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.triggers
            WHERE trigger_name = 'trg_' || tbl || '_updated_at'
              AND event_object_table = tbl
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER trg_%I_updated_at
                 BEFORE UPDATE ON %I
                 FOR EACH ROW
                 EXECUTE FUNCTION trigger_set_updated_at()',
                tbl, tbl
            );
        END IF;
    END LOOP;
END $$;


-- =============================================================================
--  5. VISTAS PARA KPI Y REPORTES (doctor)
-- =============================================================================

-- 5.1 Vista: carga de trabajo del doctor por día
CREATE OR REPLACE VIEW vista_carga_doctor AS
SELECT
    d.id_doctor,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre_doctor,
    d.especialidad,
    c.fecha,
    COUNT(c.id_cita)                                          AS total_citas,
    COUNT(*) FILTER (WHERE c.estado = 'ATENDIDA')::INT       AS atendidas,
    COUNT(*) FILTER (WHERE c.estado = 'CONFIRMADA')::INT     AS pendientes,
    COUNT(*) FILTER (WHERE c.estado = 'CANCELADA')::INT      AS canceladas
FROM doctores d
JOIN usuarios u ON u.id_usuario = d.id_usuario
LEFT JOIN citas c ON c.id_doctor = d.id_doctor
GROUP BY d.id_doctor, u.nombre, u.apellido, d.especialidad, c.fecha;

-- 5.2 Vista: rendimiento de practicantes supervisados
CREATE OR REPLACE VIEW vista_rendimiento_practicante AS
SELECT
    sp.id_supervisor,
    sp.id_practicante,
    CONCAT(up.nombre, ' ', up.apellido)                  AS nombre_practicante,
    COUNT(DISTINCT cx.id_consulta)                        AS total_consultas,
    COUNT(DISTINCT cx.id_consulta)
        FILTER (WHERE cx.estado_revision = 'APROBADO')    AS aprobadas,
    COUNT(DISTINCT cx.id_consulta)
        FILTER (WHERE cx.estado_revision = 'RECHAZADO')   AS rechazadas,
    ROUND(AVG(ep.puntuacion)::NUMERIC, 1)                 AS promedio_evaluacion,
    COUNT(ep.id_evaluacion)                               AS total_evaluaciones
FROM supervision_practicante sp
JOIN doctores dp ON dp.id_doctor = sp.id_practicante
JOIN usuarios   up ON up.id_usuario = dp.id_usuario
LEFT JOIN consultas cx ON cx.id_practicante = sp.id_practicante
LEFT JOIN evaluaciones_practicante ep ON ep.id_practicante = sp.id_practicante
WHERE sp.activo = TRUE
GROUP BY sp.id_supervisor, sp.id_practicante, up.nombre, up.apellido;


-- =============================================================================
--  6. DATOS INICIALES — Medicamentos comunes
-- =============================================================================

INSERT INTO medicamentos (nombre_comercial, nombre_generico, presentacion) VALUES
    ('Paracetamol Genfar',     'Paracetamol',          'Tableta 500mg'),
    ('Ibuprofeno MK',          'Ibuprofeno',           'Tableta 400mg'),
    ('Amoxicilina 500mg',      'Amoxicilina',          'Cápsula 500mg'),
    ('Azitromicina Genfar',    'Azitromicina',         'Tableta 500mg'),
    ('Omeprazol MK',           'Omeprazol',            'Cápsula 20mg'),
    ('Losartán MK',            'Losartán potásico',    'Tableta 50mg'),
    ('Enalapril 10mg',         'Enalapril',            'Tableta 10mg'),
    ('Metformina 850mg',       'Metformina',           'Tableta 850mg'),
    ('Salbutamol Inhalador',   'Salbutamol',           'Inhalador 200 dosis'),
    ('Diclofenaco Gel',        'Diclofenaco sódico',   'Gel tópico 30g'),
    ('Cetirizina 10mg',        'Cetirizina',           'Tableta 10mg'),
    ('Dexametasona 4mg',       'Dexametasona',         'Ampolla 4mg/2ml'),
    ('Hierro Dextrano',        'Hierro dextrano',      'Ampolla 100mg/2ml'),
    ('Ácido Fólico 5mg',       'Ácido fólico',         'Tableta 5mg'),
    ('Sulfato Ferroso',        'Sulfato ferroso',      'Gotas 50mg/ml')
ON CONFLICT (nombre_comercial, presentacion) DO NOTHING;

-- =============================================================================
--  7. COMENTARIOS DE COLUMNAS (documentación)
-- =============================================================================

COMMENT ON COLUMN medicamentos.presentacion  IS 'Ej: Tableta 500mg, Suspensión 120ml, Ampollas 2ml';
COMMENT ON COLUMN detalle_receta.dosis       IS 'Ej: 500mg';
COMMENT ON COLUMN detalle_receta.frecuencia  IS 'Ej: Cada 8 horas';
COMMENT ON COLUMN detalle_receta.duracion    IS 'Ej: 7 días';
COMMENT ON COLUMN detalle_receta.via         IS 'Oral | IV | Tópica | IM | Sublingual';

COMMIT;
