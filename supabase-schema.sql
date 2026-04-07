create extension if not exists "pgcrypto";

create table problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  content text not null,
  image_url text,
  latex_text text,
  created_at timestamp with time zone default now()
);

create table solutions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references problems(id) on delete cascade not null,
  user_id uuid not null,
  model_used text,
  raw_response jsonb,
  solution_tree jsonb not null,
  tokens_used int,
  cost_estimate numeric(10,6),
  created_at timestamp with time zone default now()
);

create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  openrouter_key_encrypted text,
  created_at timestamp with time zone default now()
);

alter table problems enable row level security;
alter table solutions enable row level security;
alter table user_preferences enable row level security;

create policy "Users can CRUD own problems" on problems for all using (auth.uid() = user_id);
create policy "Users can CRUD own solutions" on solutions for all using (auth.uid() = user_id);
create policy "Users can manage own preferences" on user_preferences for all using (auth.uid() = user_id);

create index on problems(user_id, created_at desc);
create index on solutions(problem_id);
