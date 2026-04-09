-- Admin Activity Logs Table
create table admin_activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null,
  path text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table admin_activity_logs enable row level security;

-- Policies
create policy "Only admin can view activity logs." on admin_activity_logs
  for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admins and Authors can insert activity logs." on admin_activity_logs
  for insert with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author')));

-- Enable realtime for this table
alter publication supabase_realtime add table admin_activity_logs;
