-- Check if progress column exists in projects table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- If progress doesn't exist, add it
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Verify
SELECT id, title, progress FROM projects LIMIT 5;
