-- Up Migration
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Créneau de 30 minutes d'un rendez-vous (IMMUTABLE : l'intervalle est fixe)
CREATE FUNCTION appointment_slot(ts TIMESTAMPTZ) RETURNS tstzrange AS $$
  SELECT tstzrange(ts, ts + interval '30 minutes');
$$ LANGUAGE sql IMMUTABLE;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  VARCHAR(120) NOT NULL,
  cin        VARCHAR(20)  NOT NULL UNIQUE,
  phone      VARCHAR(20)  NOT NULL,
  birth_date DATE NOT NULL CHECK (birth_date <= CURRENT_DATE),
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  created_by       UUID NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
  appointment_date TIMESTAMPTZ NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'pending',
  reason           VARCHAR(255) NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT no_overlapping_confirmed
    EXCLUDE USING gist (
      patient_id WITH =,
      appointment_slot(appointment_date) WITH &&
    ) WHERE (status = 'confirmed')
);

CREATE INDEX idx_patients_fullname_trgm ON patients USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_patients_deleted_at    ON patients (deleted_at);
CREATE INDEX idx_appt_patient           ON appointments (patient_id);
CREATE INDEX idx_appt_date              ON appointments (appointment_date);
CREATE INDEX idx_appt_status            ON appointments (status);
CREATE INDEX idx_appt_patient_date      ON appointments (patient_id, appointment_date);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patients_updated     BEFORE UPDATE ON patients     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TABLE appointments;
DROP TABLE patients;
DROP TABLE users;
DROP FUNCTION appointment_slot(TIMESTAMPTZ);
DROP FUNCTION set_updated_at();
DROP TYPE appointment_status;
DROP TYPE user_role;