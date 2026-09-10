# September 10 deployment blocker and recovery

The first staging deployment for v1 recording intake passed 153 tests and Docker build, then failed before deployment because the shared `supabase-db` container was restarting. Production and staging returned HTTP 503. Postgres reported `could not write lock file "postmaster.pid": No space left on device`. Root filesystem: 150 GB, 100% full. The onboarding code was not yet deployed when this was observed; it adds no database migration.

## Measured space usage

- `/var/log`: approximately 31 GB. `syslog.1` was 19,044,975,702 bytes, current syslog approximately 11.7 GB.
- Docker storage: approximately 53 GB. Coolify's writable layer held a 20.2 GB `/var/www/html/storage/logs/laravel.log`; `bv-diag3` held approximately 4.6 GB. Docker reported no build cache available for reclamation.
- `/data/backups`: approximately 43 GB. `/data/backups/storage/db/data` held approximately 37 GB, including 30 GB of `pg_wal`. The media storage subdirectory was approximately 18 MB. This is separate from the live Postgres mount, verified at `/data/supabase/docker/volumes/db/data`.
- Do not delete transaction-log files from any database directory on the assumption that they are disposable. The backup's retention and restore role need a separate audit.

## Recovery performed

1. Cleared downloaded apt packages. In-place gzip still failed because the disk had insufficient workspace; the original archive remained intact.
2. Streamed the archived syslog through gzip to the Mac. Fully decompressed it to verify CRC and exact byte count (19,044,975,702). SHA-256 of uncompressed contents: `bc407e7caf9f98964911d39e177aa86b4c5373e2c57f710ac77ca8042470c680`.
3. Removed only that size-checked archived file after verification, then copied the compressed archive back to the server. No application records, database files, containers, images, or backups were deleted.
4. Postgres recovered automatically. Production and staging health endpoints returned HTTP 200 with database/auth/storage all OK.
5. Changed rsyslog rotation from weekly delayed compression to daily or 100 MB, seven immediately compressed archives. Added an hourly threshold check in `/etc/cron.d/rsyslog-size-rotation`. Original config preserved at `/root/rsyslog.ply-before-20260910.bak`. Rotation ran successfully. Note: the size threshold is checked hourly, not a hard instantaneous disk cap.
6. Root disk subsequently had approximately 20 GB available (87% used). Postgres remained healthy for at least 14 minutes at the follow-up check.
7. Retried staging run 34444106005; it passed. Verified `/api/onboarding-prompts` version `recordings-v1-20s`, count 4, minimum 20, 55 bank prompts; a generated one-second clip claiming 90 seconds received 422 with measured duration 1, before storage.

## Remaining infrastructure work

Coolify's single 20.2 GB application log still needs its own rotation/retention fix. Docker is repeatedly reporting malformed container-log JSON; identify the responsible log collection/retry loop and repair it without deleting application data. Audit the 37 GB database backup and the `bv-diag3` diagnostic container before changing retention. These were identified, not automatically deleted. A disk-space alert would have detected the resource exhaustion before database failure; monitoring remains an operational follow-up.
