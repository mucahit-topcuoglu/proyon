-- Grant necessary permissions for auth.users table access
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Verify the grants
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'auth' 
AND table_name = 'users';
