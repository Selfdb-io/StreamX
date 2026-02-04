-- =====================================================
-- StreamX Database Schema
-- =====================================================

-- Media table: Stores all audio and video files


CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text DEFAULT 'Unknown Artist',
  type text NOT NULL CHECK (type IN ('audio', 'video')),
  cover text,  
  url text NOT NULL,  
  duration integer DEFAULT 0,  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);


CREATE TABLE watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  position_seconds integer NOT NULL DEFAULT 0,
  completed boolean DEFAULT false,
  updated_at timestamp DEFAULT now(),
  UNIQUE(media_id)  
);


CREATE TABLE playback_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_track_id uuid REFERENCES media(id) ON DELETE SET NULL,
  position_seconds integer DEFAULT 0,
  queue jsonb DEFAULT '[]',  
  queue_index integer DEFAULT 0,
  shuffle boolean DEFAULT false,
  repeat text DEFAULT 'off' CHECK (repeat IN ('off', 'all', 'one')),
  volume real DEFAULT 1.0 CHECK (volume >= 0 AND volume <= 1),
  updated_at timestamp DEFAULT now()
);


CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(media_id)
);


-- =====================================================
-- Notes
-- =====================================================
-- 1. In SelfDB dashboard, enable "Realtime" for tables if you want live updates.
-- 2. Storage Buckets required:
--    - "media-files" (Public) - for audio/video files
--    - "covers" (Public) - for extracted album art and thumbnails (optional)


