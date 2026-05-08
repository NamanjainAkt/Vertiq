-- TallUp domain tables: growth tracking, sleep, routines, nutrition, streaks
-- Run: supabase db reset (local) or supabase db push (remote)

-- ── Extend profiles for TallUp ─────────────────────────────────────────────

alter table public.profiles add column if not exists age              integer;
alter table public.profiles add column if not exists biological_sex   text;
alter table public.profiles add column if not exists ethnicity        text;
alter table public.profiles add column if not exists height_cm        numeric(5,1);
alter table public.profiles add column if not exists weight_kg        numeric(5,1);
alter table public.profiles add column if not exists goal_height_cm   integer;
alter table public.profiles add column if not exists commitment_days  integer default 5;

comment on column public.profiles.height_cm      is 'Current height in centimeters';
comment on column public.profiles.goal_height_cm is 'Target height goal';

-- ── Height Logs ────────────────────────────────────────────────────────────

create table public.height_logs (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade not null,
    height_cm   numeric(5,1) not null,
    logged_date date not null default current_date,
    notes       text,
    created_at  timestamptz not null default now()
);

alter table public.height_logs enable row level security;

create policy "Users can read own height logs"
    on public.height_logs for select using (auth.uid() = user_id);
create policy "Users can insert own height logs"
    on public.height_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own height logs"
    on public.height_logs for update using (auth.uid() = user_id);
create policy "Users can delete own height logs"
    on public.height_logs for delete using (auth.uid() = user_id);

create index idx_height_logs_user_date on public.height_logs(user_id, logged_date desc);

-- ── Sleep Logs ─────────────────────────────────────────────────────────────

create table public.sleep_logs (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    logged_date     date not null default current_date,
    bedtime         time not null,
    wake_time       time not null,
    duration_min    integer not null,
    quality_score   integer check (quality_score >= 1 and quality_score <= 5),
    notes           text,
    created_at      timestamptz not null default now()
);

alter table public.sleep_logs enable row level security;

create policy "Users can read own sleep logs"
    on public.sleep_logs for select using (auth.uid() = user_id);
create policy "Users can insert own sleep logs"
    on public.sleep_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own sleep logs"
    on public.sleep_logs for update using (auth.uid() = user_id);
create policy "Users can delete own sleep logs"
    on public.sleep_logs for delete using (auth.uid() = user_id);

create index idx_sleep_logs_user_date on public.sleep_logs(user_id, logged_date desc);

-- ── Routine Completions ────────────────────────────────────────────────────

create table public.routine_logs (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references auth.users(id) on delete cascade not null,
    routine_name        text not null,
    day_number          integer not null default 1,
    total_exercises     integer not null default 0,
    completed_exercises integer not null default 0,
    duration_min        integer,
    is_rest_day         boolean not null default false,
    logged_date         date not null default current_date,
    created_at          timestamptz not null default now()
);

alter table public.routine_logs enable row level security;

create policy "Users can read own routine logs"
    on public.routine_logs for select using (auth.uid() = user_id);
create policy "Users can insert own routine logs"
    on public.routine_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own routine logs"
    on public.routine_logs for update using (auth.uid() = user_id);

create index idx_routine_logs_user_date on public.routine_logs(user_id, logged_date desc);

-- ── Nutrition Logs ─────────────────────────────────────────────────────────

create table public.nutrition_logs (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    logged_date     date not null default current_date,
    nutrient        text not null,  -- calcium, vitamin_d, protein, zinc, magnesium, vitamin_k2
    food_name       text,
    amount_mg       integer,
    goal_mg         integer default 0,
    created_at      timestamptz not null default now()
);

alter table public.nutrition_logs enable row level security;

create policy "Users can read own nutrition logs"
    on public.nutrition_logs for select using (auth.uid() = user_id);
create policy "Users can insert own nutrition logs"
    on public.nutrition_logs for insert with check (auth.uid() = user_id);

create index idx_nutrition_logs_user_date on public.nutrition_logs(user_id, logged_date desc);

-- ── Hydration Logs ─────────────────────────────────────────────────────────

create table public.hydration_logs (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade not null,
    logged_date date not null default current_date,
    glasses     integer not null default 0,
    goal        integer not null default 8,
    created_at  timestamptz not null default now()
);

alter table public.hydration_logs enable row level security;

create policy "Users can read own hydration logs"
    on public.hydration_logs for select using (auth.uid() = user_id);
create policy "Users can insert own hydration logs"
    on public.hydration_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own hydration logs"
    on public.hydration_logs for update using (auth.uid() = user_id);

-- ── Streaks ────────────────────────────────────────────────────────────────

create table public.streaks (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    streak_type     text not null check (streak_type in ('height', 'sleep', 'routine', 'nutrition')),
    current_count   integer not null default 0,
    longest_count   integer not null default 0,
    last_activity_date date,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    unique(user_id, streak_type)
);

alter table public.streaks enable row level security;

create policy "Users can read own streaks"
    on public.streaks for select using (auth.uid() = user_id);
create policy "Users can insert own streaks"
    on public.streaks for insert with check (auth.uid() = user_id);
create policy "Users can update own streaks"
    on public.streaks for update using (auth.uid() = user_id);

create trigger set_streaks_updated_at
    before update on public.streaks
    for each row execute function set_updated_at();

-- ── Achievements ───────────────────────────────────────────────────────────

create table public.achievements (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    achievement_key text not null,
    unlocked_at     timestamptz not null default now(),
    unique(user_id, achievement_key)
);

alter table public.achievements enable row level security;

create policy "Users can read own achievements"
    on public.achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements"
    on public.achievements for insert with check (auth.uid() = user_id);
