-- Up Migration
ALTER TABLE patients DROP CONSTRAINT patients_cin_key;
CREATE UNIQUE INDEX patients_cin_active_unique ON patients (cin) WHERE deleted_at IS NULL;

-- Down Migration
DROP INDEX patients_cin_active_unique;
ALTER TABLE patients ADD CONSTRAINT patients_cin_key UNIQUE (cin);