-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create map_feature_types table
CREATE TABLE map_feature_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    geometry_type TEXT NOT NULL CHECK (geometry_type IN ('Point', 'LineString', 'Polygon')),
    style JSONB NOT NULL,
    feature_form JSONB NOT NULL,
    has_inspection_form BOOLEAN DEFAULT false,
    inspection_form JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create icons table
CREATE TABLE icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create map_features table
CREATE TABLE map_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID NOT NULL REFERENCES map_feature_types(id) ON DELETE CASCADE,
    geometry JSONB NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create inspections table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL REFERENCES map_features(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('feature', 'inspection')),
    entity_id UUID NOT NULL,
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_entity
        FOREIGN KEY (entity_id)
        REFERENCES CASE 
            WHEN entity_type = 'feature' THEN map_features(id)
            WHEN entity_type = 'inspection' THEN inspections(id)
        END
        ON DELETE CASCADE
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_feature_types_updated_at
    BEFORE UPDATE ON map_feature_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_features_updated_at
    BEFORE UPDATE ON map_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_feature_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users and superadmins
DROP POLICY IF EXISTS "Allow full access to all users" ON sections;
DROP POLICY IF EXISTS "Allow full access to all users" ON map_feature_types;
DROP POLICY IF EXISTS "Allow full access to all users" ON map_features;
DROP POLICY IF EXISTS "Allow full access to all users" ON inspections;
DROP POLICY IF EXISTS "Allow full access to all users" ON icons;
DROP POLICY IF EXISTS "Allow full access to all users" ON photos;

-- Sections policies
CREATE POLICY "Allow read access to authenticated users" ON sections
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access to superadmins" ON sections
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'superadmin')
    WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Map feature types policies
CREATE POLICY "Allow read access to authenticated users" ON map_feature_types
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access to superadmins" ON map_feature_types
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'superadmin')
    WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Map features policies
CREATE POLICY "Allow read access to authenticated users" ON map_features
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access to authenticated users" ON map_features
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update/delete to superadmins" ON map_features
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'superadmin')
    WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Inspections policies
CREATE POLICY "Allow read access to authenticated users" ON inspections
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access to authenticated users" ON inspections
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update/delete to superadmins" ON inspections
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'superadmin')
    WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Icons policies
CREATE POLICY "Allow read access to authenticated users" ON icons
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access to superadmins" ON icons
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'superadmin')
    WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Photos policies
CREATE POLICY "Allow read access to authenticated users" ON photos
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write access to authenticated users" ON photos
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update/delete to superadmins" ON photos
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'superadmin')
    WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Create function to set user claims
CREATE OR REPLACE FUNCTION set_claim(uid uuid, claim text, value text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = uid
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    json_build_object(claim, value)::jsonb
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable realtime subscriptions for schema-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE sections;
ALTER PUBLICATION supabase_realtime ADD TABLE map_feature_types;

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;

-- Ensure future tables inherit the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon; 