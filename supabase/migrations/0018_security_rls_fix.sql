-- Fix Profiles UPDATE policy
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Fix Categories UPDATE policy
drop policy if exists "Admin can update categories." on categories;
create policy "Admin can update categories." on categories for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Fix Tags UPDATE policy
drop policy if exists "Admin can update tags." on tags;
create policy "Admin can update tags." on tags for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Fix Articles UPDATE policy
drop policy if exists "Admin and Authors can update articles." on articles;
create policy "Admin and Authors can update articles." on articles for update using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author'))) with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author')));

-- Add Storage Policies for the "content" bucket
insert into storage.buckets (id, name, public) values ('content', 'content', true) on conflict (id) do nothing;

create policy "Anyone can read content" on storage.objects for select using ( bucket_id = 'content' );
create policy "Admins and Authors can insert content" on storage.objects for insert with check ( bucket_id = 'content' and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'author')) );
create policy "Admins and Authors can update content" on storage.objects for update using ( bucket_id = 'content' and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'author')) );
create policy "Admins and Authors can delete content" on storage.objects for delete using ( bucket_id = 'content' and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'author')) );
