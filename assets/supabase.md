# Supabase Configuration for Music Streamer

## Database Schema

### Tables Required

#### 1. profiles
This table stores user profile information linked to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
```

#### 2. playlists
This table stores user playlists.

```sql
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public playlists or own playlists"
  ON playlists FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can manage own playlists"
  ON playlists FOR ALL
  USING (auth.uid() = owner_id);

CREATE INDEX idx_playlists_owner_id ON playlists(owner_id);
```

#### 3. playlist_tracks (Future)
This table will store tracks in playlists.

```sql
CREATE TABLE playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  track_id TEXT NOT NULL,  -- Audius track ID
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracks in accessible playlists"
  ON playlist_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND (playlists.is_public = true OR playlists.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage tracks in own playlists"
  ON playlist_tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND playlists.owner_id = auth.uid()
    )
  );

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
```

#### 4. listening_history (Future)
This table will track user listening history.

```sql
CREATE TABLE listening_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id TEXT NOT NULL,  -- Audius track ID
  listened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false
);

ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listening history"
  ON listening_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listening history"
  ON listening_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_listened_at ON listening_history(listened_at DESC);
```

## Environment Variables

The backend requires the following Supabase environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key (for server-side operations)

These are already configured in the .env file.

## Authentication Flow

1. **Registration**: POST /api/auth/register
   - Creates user in Supabase Auth
   - Creates profile entry in profiles table
   - Returns user, profile, and session data

2. **Login**: POST /api/auth/login
   - Authenticates with Supabase Auth
   - Returns user and session data (access_token, refresh_token)

3. **Logout**: POST /api/auth/logout
   - Requires Bearer token in Authorization header
   - Invalidates the session

4. **Get Current User**: GET /api/auth/me
   - Requires Bearer token in Authorization header
   - Returns user and profile data

## Security Notes

- The backend uses the anon/public key for server-side operations
- JWT tokens are validated on each protected endpoint
- Row Level Security (RLS) policies ensure users can only access their own data
- Never expose the service_role key to the frontend
- All auth operations happen server-side to maintain security

## Integration Status

✅ Backend Express routes implemented
✅ Supabase client configured server-side
✅ Profile creation on registration
✅ CORS configured for frontend at localhost:3000

⏳ Pending: Database tables creation in Supabase
⏳ Pending: Frontend integration with auth endpoints
