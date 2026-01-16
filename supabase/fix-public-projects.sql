-- Update projects to be public if they have an active public share
UPDATE projects 
SET is_public = true 
WHERE id IN (
  SELECT project_id 
  FROM public_shares 
  WHERE is_active = true
);

-- Verify the update
SELECT 
  p.id,
  p.title,
  p.is_public,
  ps.is_active as has_active_share
FROM projects p
JOIN public_shares ps ON ps.project_id = p.id
WHERE ps.is_active = true;
