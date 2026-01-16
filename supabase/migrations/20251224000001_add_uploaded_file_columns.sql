-- ============================================================================
-- UPLOADED FILE COLUMNS
-- ============================================================================
-- Proje oluşturma sırasında yüklenen dosya bilgilerini saklamak için kolonlar

-- Add uploaded file columns to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS uploaded_file_url TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_file_name TEXT;

-- Add comments
COMMENT ON COLUMN projects.uploaded_file_url IS 'Yüklenen dosyanın public URL''i (PDF, DOCX, TXT)';
COMMENT ON COLUMN projects.uploaded_file_name IS 'Yüklenen dosyanın orijinal adı';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_uploaded_file ON projects(uploaded_file_url) WHERE uploaded_file_url IS NOT NULL;
