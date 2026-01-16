-- Add sub_steps column to roadmap_nodes table
-- This will store checklist items for each roadmap step

-- Add column
ALTER TABLE roadmap_nodes 
ADD COLUMN IF NOT EXISTS sub_steps JSONB DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN roadmap_nodes.sub_steps IS 'Checklist of sub-tasks in format: [{"task": "string", "detail": "string", "completed": boolean}]';

-- Example data structure:
-- [
--   {
--     "task": "Proje başlat",
--     "detail": "Terminal aç, `cd project` → `npm init -y` çalıştır",
--     "completed": false
--   },
--   {
--     "task": "Dependencies kur",
--     "detail": "`npm install express typescript` → package.json kontrol et",
--     "completed": false
--   }
-- ]

SELECT '✅ sub_steps column added to roadmap_nodes!' as message;
