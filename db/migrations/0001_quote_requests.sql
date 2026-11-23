-- Every quote request the site receives, stored before the email is sent.
--
-- Stored first, so a request survives anything that happens to the email:
-- an SMTP outage, a wrong password, or Vercel stopping the function at its
-- time limit (the row then stays 'pending'). `email_status` says which.
--
-- `payload` is the full versioned request (`QuotePayload` in
-- src/lib/quote/schema.ts); `payload_version` is its `v`. The columns beside
-- it copy the few fields worth filtering on, so a future admin page or a
-- resend job can query without reaching into JSON.
--
-- Safe to run more than once.

create table if not exists quote_requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),

  payload_version  integer not null,
  payload          jsonb not null,
  message          text not null,

  mode             text,
  category         text,
  contact_name     text not null,
  contact_phone    text not null,
  contact_email    text,
  reply_channel    text not null,
  source_page      text,

  email_status     text not null default 'pending'
                   check (email_status in ('pending', 'sent', 'failed')),
  email_attempts   integer not null default 0,
  email_last_error text,
  email_message_id text,
  email_sent_at    timestamptz,
  updated_at       timestamptz not null default now()
);

-- Anything not yet delivered: what a resend job or a person checks first.
create index if not exists quote_requests_undelivered
  on quote_requests (created_at)
  where email_status <> 'sent';

create index if not exists quote_requests_created_at
  on quote_requests (created_at desc);
