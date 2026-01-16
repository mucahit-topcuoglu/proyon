-- Add likes_count column to public_shares table
ALTER TABLE public_shares ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create public_share_likes table
CREATE TABLE IF NOT EXISTS public_share_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public_shares(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(share_id, user_identifier)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_public_share_likes_share_id ON public_share_likes(share_id);
CREATE INDEX IF NOT EXISTS idx_public_share_likes_user_identifier ON public_share_likes(user_identifier);

-- Enable RLS
ALTER TABLE public_share_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view likes" ON public_share_likes;
DROP POLICY IF EXISTS "Anyone can like" ON public_share_likes;
DROP POLICY IF EXISTS "Anyone can unlike" ON public_share_likes;

-- Allow anyone to read likes
CREATE POLICY "Anyone can view likes" ON public_share_likes
  FOR SELECT USING (true);

-- Allow anyone to insert likes
CREATE POLICY "Anyone can like" ON public_share_likes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to delete their own likes
CREATE POLICY "Anyone can unlike" ON public_share_likes
  FOR DELETE USING (true);
