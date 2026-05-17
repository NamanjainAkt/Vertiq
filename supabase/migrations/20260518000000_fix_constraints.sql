-- Fix missing unique constraints needed by API upserts
-- The app uses onConflict: 'user_id,logged_date' for routine_logs and hydration_logs

alter table public.routine_logs
  add constraint routine_logs_user_date_unique unique (user_id, logged_date);

alter table public.hydration_logs
  add constraint hydration_logs_user_date_unique unique (user_id, logged_date);
