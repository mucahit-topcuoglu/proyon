-- =============================================
-- ADD CATEGORY_IDS COLUMN TO PROJECT_MEMBERS
-- =============================================
-- This migration adds category access control to project members
-- Members can be restricted to specific categories

-- Add category_ids column (array of text/uuid)
ALTER TABLE project_members 
ADD COLUMN IF NOT EXISTS category_ids text[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN project_members.category_ids IS 
'Array of category IDs that member can access. NULL = access to all categories';

-- Create index for better performance when filtering by categories
CREATE INDEX IF NOT EXISTS idx_project_members_category_ids 
ON project_members USING GIN (category_ids);

-- Update RLS policies to respect category restrictions (if needed)
-- This ensures users can only see nodes from their allowed categories

COMMENT ON TABLE project_members IS 
'Project team members with role-based and category-based access control';
