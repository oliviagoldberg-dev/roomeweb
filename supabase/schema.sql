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
  "notifyMatches" boolean default true,
  "notifyMessages" boolean default true,
  "notifyListings" boolean default true,
  "notifyFriendRequests" boolean default true,
  "createdAt" timestamptz default now()
);

-- Listing Folders
create table if not exists listingfolders (
  "id" uuid primary key default uuid_generate_v4(),
  "ownerUid" uuid,
  "name" text,
  "createdAt" timestamptz default now()
);

-- Folder Shares
create table if not exists foldershares (
  "id" uuid primary key default uuid_generate_v4(),
  "folderId" uuid references listingfolders(id) on delete cascade,
  "ownerUid" uuid,
  "sharedWithUid" uuid,
  "createdAt" timestamptz default now()
);

-- Listings
create table if not exists listings (
  "id" uuid primary key default uuid_generate_v4(),
  "ownerUid" uuid,
  "folderId" uuid references listingfolders(id) on delete set null,
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
alter table listingfolders enable row level security;
alter table foldershares enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table friendships enable row level security;
alter table friendRequests enable row level security;
alter table notifications enable row level security;
alter table inviteCodes enable row level security;

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- All authenticated users can read all profiles (needed for browse/discover)
create policy "profiles select all" on profiles
  for select using (auth.role() = 'authenticated');
-- Users can only insert/update/delete their own profile
create policy "profiles insert own" on profiles
  for insert with check (auth.uid()::text = id::text);
create policy "profiles update own" on profiles
  for update using (auth.uid()::text = id::text) with check (auth.uid()::text = id::text);
create policy "profiles delete own" on profiles
  for delete using (auth.uid()::text = id::text);

-- ─── Listings ─────────────────────────────────────────────────────────────────
-- Authenticated users can read all listings (for notifications + shared folders)
create policy "listings select all" on listings
  for select using (auth.role() = 'authenticated');
create policy "listings insert own" on listings
  for insert with check (auth.uid()::text = "ownerUid"::text);
create policy "listings update own" on listings
  for update using (auth.uid()::text = "ownerUid"::text) with check (auth.uid()::text = "ownerUid"::text);
create policy "listings delete own" on listings
  for delete using (auth.uid()::text = "ownerUid"::text);

-- ─── Listing Folders ──────────────────────────────────────────────────────────
create policy "listingfolders select" on listingfolders
  for select using (
    auth.uid()::text = "ownerUid"::text
    or exists (
      select 1 from foldershares
      where "folderId" = listingfolders.id
        and "sharedWithUid"::text = auth.uid()::text
    )
  );
create policy "listingfolders own" on listingfolders
  for all using (auth.uid()::text = "ownerUid"::text) with check (auth.uid()::text = "ownerUid"::text);

-- ─── Folder Shares ────────────────────────────────────────────────────────────
create policy "foldershares select" on foldershares
  for select using (
    auth.uid()::text = "ownerUid"::text
    or auth.uid()::text = "sharedWithUid"::text
  );
create policy "foldershares own" on foldershares
  for all using (auth.uid()::text = "ownerUid"::text) with check (auth.uid()::text = "ownerUid"::text);

-- ─── Conversations ────────────────────────────────────────────────────────────
create policy "convos participant" on conversations
  for all using (auth.uid()::text = any("participants")) with check (auth.uid()::text = any("participants"));

-- ─── Messages ─────────────────────────────────────────────────────────────────
-- Participants can read all messages in their conversations
create policy "messages select" on messages
  for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages."convoId"
        and auth.uid()::text = any(conversations."participants")
    )
  );
create policy "messages insert own" on messages
  for insert with check (auth.uid()::text = "senderUID"::text);
create policy "messages update own" on messages
  for update using (auth.uid()::text = "senderUID"::text) with check (auth.uid()::text = "senderUID"::text);

-- ─── Friendships ──────────────────────────────────────────────────────────────
create policy "friendships participant" on friendships
  for all using (auth.uid()::text = any("users")) with check (auth.uid()::text = any("users"));

-- ─── Friend Requests ──────────────────────────────────────────────────────────
create policy "friendrequests sender_or_receiver" on friendRequests
  for all using (auth.uid()::text = "fromUID"::text or auth.uid()::text = "toUID"::text)
  with check (auth.uid()::text = "fromUID"::text or auth.uid()::text = "toUID"::text);

-- ─── Notifications ────────────────────────────────────────────────────────────
create policy "notifications receiver" on notifications
  for all using (auth.uid()::text = "toUID"::text) with check (auth.uid()::text = "toUID"::text);

-- ─── Invite Codes ─────────────────────────────────────────────────────────────
-- Anyone authenticated can read invite codes (needed to validate them at signup)
create policy "invite codes select" on inviteCodes
  for select using (auth.role() = 'authenticated');
create policy "invite codes own" on inviteCodes
  for all using (auth.uid()::text = "uid"::text) with check (auth.uid()::text = "uid"::text);
