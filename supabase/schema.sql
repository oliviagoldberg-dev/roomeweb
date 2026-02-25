-- Supabase schema for ROOMe (single-user friendly, RLS enabled)

-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists profiles (
  "id" uuid primary key references auth.users (id) on delete cascade,
  "uid" uuid,
  "email" text,
  "name" text,
  "username" text,
  "phone" text,
  "age" text,
  "occupation" text,
  "company" text,
  "companyIndustry" text,
  "school" text,
  "university" text,
  "city" text,
  "moveCity" text,
  "hometown" text,
  "neighborhood" text,
  "neighborhoodPreferences" text[] default '{}',
  "bio" text,
  "budgetMin" int default 0,
  "budgetMax" int default 0,
  "beds" text,
  "baths" text,
  "leaseLength" text,
  "furnished" boolean default false,
  "hasAC" boolean default false,
  "hasLaundry" boolean default false,
  "hasParking" boolean default false,
  "moveInDate" text,
  "hasPet" boolean default false,
  "smokes" boolean default false,
  "host" boolean default false,
  "cleanliness" int default 3,
  "sleepSchedule" text,
  "workFromHome" text,
  "preferredTemp" text,
  "profileImageURL" text,
  "photoURLs" text[] default '{}',
  "connections" text[] default '{}',
  "likedBy" text[] default '{}',
  "onboardingComplete" boolean default false,
  "inviteCode" text,
  "createdAt" timestamptz default now()
);

-- Listings
create table if not exists listings (
  "id" uuid primary key default uuid_generate_v4(),
  "ownerUid" uuid,
  "url" text,
  "title" text,
  "imageUrl" text,
  "description" text,
  "source" text,
  "city" text,
  "neighborhood" text,
  "rent" int,
  "utilities" int,
  "beds" text,
  "baths" text,
  "leaseLength" text,
  "amenities" text[] default '{}',
  "moveInDate" text,
  "photoURLs" text[] default '{}',
  "notes" text,
  "createdAt" timestamptz default now()
);

-- Conversations
create table if not exists conversations (
  "id" text primary key,
  "participants" text[] default '{}',
  "lastMessage" text,
  "lastMessageTime" timestamptz,
  "unreadCount" jsonb default '{}'::jsonb
);

-- Messages
create table if not exists messages (
  "id" uuid primary key default uuid_generate_v4(),
  "convoId" text,
  "senderUID" text,
  "text" text,
  "isLink" boolean default false,
  "listing" jsonb,
  "createdAt" timestamptz default now()
);

-- Friendships
create table if not exists friendships (
  "id" uuid primary key default uuid_generate_v4(),
  "users" text[] default '{}',
  "createdAt" timestamptz default now()
);

-- Friend Requests
create table if not exists friendRequests (
  "id" uuid primary key default uuid_generate_v4(),
  "fromUID" text,
  "toUID" text,
  "status" text,
  "timestamp" timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  "id" uuid primary key default uuid_generate_v4(),
  "toUID" text,
  "fromUID" text,
  "type" text,
  "title" text,
  "body" text,
  "read" boolean default false,
  "createdAt" timestamptz default now()
);

-- Invite Codes
create table if not exists inviteCodes (
  "code" text primary key,
  "uid" text,
  "createdAt" timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table friendships enable row level security;
alter table friendRequests enable row level security;
alter table notifications enable row level security;
alter table inviteCodes enable row level security;

-- Policies (single-user friendly)
create policy "profiles own row" on profiles
  for all using (auth.uid()::text = id::text) with check (auth.uid()::text = id::text);

create policy "listings own row" on listings
  for all using (auth.uid()::text = "ownerUid"::text) with check (auth.uid()::text = "ownerUid"::text);

create policy "convos participant" on conversations
  for all using (auth.uid()::text = any("participants")) with check (auth.uid()::text = any("participants"));

create policy "messages participant" on messages
  for all using (auth.uid()::text = "senderUID"::text) with check (auth.uid()::text = "senderUID"::text);

create policy "friendships participant" on friendships
  for all using (auth.uid()::text = any("users")) with check (auth.uid()::text = any("users"));

create policy "friendrequests sender_or_receiver" on friendRequests
  for all using (auth.uid()::text = "fromUID"::text or auth.uid()::text = "toUID"::text)
  with check (auth.uid()::text = "fromUID"::text or auth.uid()::text = "toUID"::text);

create policy "notifications receiver" on notifications
  for all using (auth.uid()::text = "toUID"::text) with check (auth.uid()::text = "toUID"::text);

create policy "invite codes owner" on inviteCodes
  for all using (auth.uid()::text = "uid"::text) with check (auth.uid()::text = "uid"::text);
