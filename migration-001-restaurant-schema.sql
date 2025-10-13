-- Migration 001: Restaurant-Centric Schema
-- Run this in Supabase SQL Editor

-- 1. Create restaurants table (centralized restaurant data)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Google Maps data (when available)
  place_id TEXT UNIQUE,
  google_maps_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Manual entry data (for cloud kitchens)
  manual_address TEXT,
  is_cloud_kitchen BOOLEAN DEFAULT false,
  
  -- Metadata
  source_type TEXT NOT NULL CHECK (source_type IN ('google_maps', 'manual')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create dish availability channels table
CREATE TABLE dish_availability_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('In-Store', 'Online')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(dish_id, channel)
);

-- 3. Create dish delivery apps table (only for Online channel)
CREATE TABLE dish_delivery_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  availability_channel_id UUID NOT NULL REFERENCES dish_availability_channels(id) ON DELETE CASCADE,
  delivery_app TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(dish_id, availability_channel_id, delivery_app)
);

-- 4. Add restaurant_id column to dishes table (nullable initially for migration)
ALTER TABLE dishes 
  ADD COLUMN restaurant_id UUID REFERENCES restaurants(id);

-- 5. Create indexes for performance
CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_place_id ON restaurants(place_id);
CREATE INDEX idx_restaurants_name_city ON restaurants(name, city);

-- 6. Enable RLS on new tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_availability_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_delivery_apps ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for restaurants table
CREATE POLICY "Allow public read access to restaurants" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update restaurants" ON restaurants
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Create RLS policies for dish_availability_channels table
CREATE POLICY "Allow public read access to dish availability channels" ON dish_availability_channels
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert dish availability channels" ON dish_availability_channels
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow dish owners to update availability channels" ON dish_availability_channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_availability_channels.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow dish owners to delete availability channels" ON dish_availability_channels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_availability_channels.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

-- 9. Create RLS policies for dish_delivery_apps table
CREATE POLICY "Allow public read access to dish delivery apps" ON dish_delivery_apps
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert dish delivery apps" ON dish_delivery_apps
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow dish owners to update delivery apps" ON dish_delivery_apps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_delivery_apps.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow dish owners to delete delivery apps" ON dish_delivery_apps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_delivery_apps.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

-- 10. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create trigger for restaurants table
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
