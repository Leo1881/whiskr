-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE whiskey_type AS ENUM (
  'single_malt',
  'blended_malt',
  'blended_whiskey',
  'bourbon',
  'rye',
  'corn',
  'wheat',
  'irish',
  'scotch',
  'japanese',
  'canadian',
  'other'
);

CREATE TYPE region_type AS ENUM (
  'highland',
  'lowland',
  'speyside',
  'islay',
  'campbeltown',
  'islands',
  'kentucky',
  'tennessee',
  'ireland',
  'japan',
  'canada',
  'other'
);

-- Whiskeys table
CREATE TABLE whiskeys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  distillery VARCHAR(255) NOT NULL,
  type whiskey_type NOT NULL,
  region region_type NOT NULL,
  age INTEGER,
  abv DECIMAL(4,2),
  description TEXT,
  image_url TEXT,
  barcode VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX idx_whiskeys_name ON whiskeys USING gin (name gin_trgm_ops);
CREATE INDEX idx_whiskeys_brand ON whiskeys USING gin (brand gin_trgm_ops);
CREATE INDEX idx_whiskeys_distillery ON whiskeys USING gin (distillery gin_trgm_ops);
CREATE INDEX idx_whiskeys_type ON whiskeys (type);
CREATE INDEX idx_whiskeys_region ON whiskeys (region);
CREATE INDEX idx_whiskeys_barcode ON whiskeys (barcode);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  whiskey_id UUID REFERENCES whiskeys(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  tasting_notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, whiskey_id) -- One review per user per whiskey
);

-- Create indexes for reviews
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
CREATE INDEX idx_reviews_whiskey_id ON reviews (whiskey_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);
CREATE INDEX idx_reviews_created_at ON reviews (created_at DESC);

-- User favorites table
CREATE TABLE user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  whiskey_id UUID REFERENCES whiskeys(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, whiskey_id)
);

-- Create indexes for favorites
CREATE INDEX idx_user_favorites_user_id ON user_favorites (user_id);
CREATE INDEX idx_user_favorites_whiskey_id ON user_favorites (whiskey_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_whiskeys_updated_at BEFORE UPDATE ON whiskeys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- View for whiskey with average rating
CREATE VIEW whiskey_with_ratings AS
SELECT 
  w.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM whiskeys w
LEFT JOIN reviews r ON w.id = r.whiskey_id
GROUP BY w.id;
