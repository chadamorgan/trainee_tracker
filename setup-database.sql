-- Drill Sergeant Trainee Tracker Database Setup
-- Run this script in your Supabase SQL Editor

-- Create trainees table
CREATE TABLE IF NOT EXISTS trainees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platoon TEXT NOT NULL,
    rank TEXT,
    gender TEXT,
    status TEXT DEFAULT 'Present',
    location TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    profile JSONB DEFAULT '{}'::jsonb,
    appointments JSONB DEFAULT '[]'::jsonb,
    fitness JSONB DEFAULT '{}'::jsonb,
    counseling_history JSONB DEFAULT '[]'::jsonb,
    training_events JSONB DEFAULT '[]'::jsonb,
    custom_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_events table
CREATE TABLE IF NOT EXISTS training_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platoon_tasks table
CREATE TABLE IF NOT EXISTS platoon_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_metadata table
CREATE TABLE IF NOT EXISTS app_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    last_daily_check_in DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trainees_platoon ON trainees(platoon);
CREATE INDEX IF NOT EXISTS idx_trainees_status ON trainees(status);
CREATE INDEX IF NOT EXISTS idx_trainees_gender ON trainees(gender);
CREATE INDEX IF NOT EXISTS idx_platoon_tasks_priority ON platoon_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_platoon_tasks_completed ON platoon_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_platoon_tasks_due_date ON platoon_tasks(due_date);

-- Insert some default training events
INSERT INTO training_events (name) VALUES 
    ('Weapons Qualification'),
    ('Physical Fitness Test'),
    ('Land Navigation'),
    ('First Aid'),
    ('Chemical Warfare'),
    ('Combat Water Survival'),
    ('Confidence Course'),
    ('Rappelling'),
    ('Field Training Exercise'),
    ('Graduation Requirements')
ON CONFLICT (name) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on trainees table
CREATE TRIGGER update_trainees_updated_at 
    BEFORE UPDATE ON trainees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platoon_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust as needed for your security requirements)
CREATE POLICY "Allow anonymous access to trainees" ON trainees
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to training_events" ON training_events
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to platoon_tasks" ON platoon_tasks
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to app_metadata" ON app_metadata
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;