-- Per-sender rate limit for /api/quote.
--
-- `ip_hash` is the hex SHA-256 of the sender's IP address, never the address
-- itself. `src/pages/api/quote.ts` counts a hash's rows in the last few
-- minutes and answers 429 past the limit. Null for rows stored before this
-- migration and for requests whose address could not be read.
--
-- Safe to run more than once.

alter table quote_requests add column if not exists ip_hash text;

create index if not exists quote_requests_ip_hash_created_at
  on quote_requests (ip_hash, created_at desc)
  where ip_hash is not null;
