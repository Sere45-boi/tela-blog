-- Newsletter Subscribers Table
create table public.subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  first_name text,
  last_name text,
  is_active boolean default true not null,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone
);

-- RLS Policies
alter table public.subscribers enable row level security;

-- Public can subscribe (insert only)
create policy "Public can subscribe to newsletter." on public.subscribers
  for insert with check (true);

-- Only admin can view subscribers
create policy "Admin can view all subscribers." on public.subscribers
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admin can update/delete subscribers
create policy "Admin can update subscribers." on public.subscribers
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
