-- Migration script to update creator_applications table schema

-- Add new columns
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS professional_title VARCHAR(255);
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);

-- Remove old columns (if they exist)
ALTER TABLE creator_applications DROP COLUMN IF EXISTS project_category;
ALTER TABLE creator_applications DROP COLUMN IF EXISTS project_description;
ALTER TABLE creator_applications DROP COLUMN IF EXISTS bio;
ALTER TABLE creator_applications DROP COLUMN IF EXISTS experience;
ALTER TABLE creator_applications DROP COLUMN IF EXISTS portfolio;

-- Show the updated table structure
\d creator_applications;
