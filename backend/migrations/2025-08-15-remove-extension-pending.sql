-- Migration: Remove extension_pending and extension_requested_at from loans table
PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- SQLite does not support DROP COLUMN directly, so we need to recreate the table
CREATE TABLE loans_new AS SELECT id, book_id, student_id, borrowed_at, returned_at, renewals, due_date, extended_phase, extended_started_at, last_nudged_at FROM loans;

DROP TABLE loans;

ALTER TABLE loans_new RENAME TO loans;

COMMIT;
PRAGMA foreign_keys=on;
