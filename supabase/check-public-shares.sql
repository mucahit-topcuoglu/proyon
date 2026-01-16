-- Check public shares status
SELECT 
  ps.id,
  ps.share_token,
  ps.is_active,
  ps.view_count,
  ps.created_at,
  p.title as project_title,
  p.description as project_description
FROM public_shares ps
LEFT JOIN projects p ON p.id = ps.project_id
ORDER BY ps.created_at DESC;

-- Check if any projects are marked as public
SELECT 
  id,
  title,
  is_public,
  created_at
FROM projects
WHERE is_public = true
ORDER BY created_at DESC;

-- Count total public shares
SELECT 
  COUNT(*) as total_shares,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_shares,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_shares
FROM public_shares;
