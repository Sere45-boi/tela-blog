-- Custom Types
create type user_role as enum ('admin', 'author', 'user');
create type article_status as enum ('draft', 'published', 'scheduled');

-- Profiles Table (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role default 'user'::user_role not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tags Table
create table tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Articles Table
create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  featured_image text,
  author_id uuid references profiles(id) not null,
  category_id uuid references categories(id) on delete set null,
  status article_status default 'draft'::article_status not null,
  is_featured boolean default false not null,
  meta_title text,
  meta_description text,
  view_count integer default 0 not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Article_Tags Join Table
create table article_tags (
  article_id uuid references articles(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  primary key (article_id, tag_id)
);

-- Analytics Table
create table analytics (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references articles(id) on delete cascade not null,
  reader_id text, -- Can be ip hash or user id
  read_time_seconds integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies Setup
alter table profiles enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table articles enable row level security;
alter table article_tags enable row level security;
alter table analytics enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Categories & Tags Policies (Public Read, Admin Write)
create policy "Categories visible to everyone." on categories for select using (true);
create policy "Tags visible to everyone." on tags for select using (true);
-- Write policies (simplified with subquery check)
create policy "Admin can insert categories." on categories for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can update categories." on categories for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can delete categories." on categories for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admin can insert tags." on tags for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can update tags." on tags for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can delete tags." on tags for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Articles Policies
create policy "Published articles visible to everyone." on articles for select using (status = 'published');
create policy "Draft/Scheduled articles visible ONLY to admins/authors." on articles for select using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author')));
create policy "Admin and Authors can insert articles." on articles for insert with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author')));
create policy "Admin and Authors can update articles." on articles for update using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author')));
create policy "Admin can delete articles." on articles for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Article_Tags Policies
create policy "Article tags visible to everyone." on article_tags for select using (true);
create policy "Admin and Authors can mutate article tags." on article_tags for all using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author')));

-- Analytics Policies
create policy "Anyone can insert analytics (track views)." on analytics for insert with check (true);
create policy "Only admin can view analytics." on analytics for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Functions & Triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_modtime before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_articles_modtime before update on articles for each row execute procedure update_updated_at_column();

-- Function to handle new user signup
create or replace function handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
