-- Add uploaded file columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS uploaded_file_url TEXT,
ADD COLUMN IF NOT EXISTS uploaded_file_name TEXT;

-- Add comment
COMMENT ON COLUMN projects.uploaded_file_url IS 'Yüklenen proje dökümanı URL (PDF, DOCX, TXT)';
COMMENT ON COLUMN projects.uploaded_file_name IS 'Yüklenen dosyanın orijinal adı';
