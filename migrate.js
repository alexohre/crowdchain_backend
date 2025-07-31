const { Pool } = require('pg');
require('dotenv').config();

console.log('Database URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateSchema() {
  const client = await pool.connect();
  try {
    console.log('🔄 Updating database schema...');
    
    // Add missing columns
    await client.query('ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS professional_title VARCHAR(255)');
    console.log('✅ Added professional_title column');
    
    await client.query('ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500)');
    console.log('✅ Added linkedin_url column');
    
    await client.query('ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS website_url VARCHAR(500)');
    console.log('✅ Added website_url column');
    
    // Remove old columns if they exist
    try {
      await client.query('ALTER TABLE creator_applications DROP COLUMN IF EXISTS project_category');
      console.log('✅ Removed project_category column');
    } catch (e) { console.log('ℹ️ project_category column already removed or never existed'); }
    
    try {
      await client.query('ALTER TABLE creator_applications DROP COLUMN IF EXISTS project_description');
      console.log('✅ Removed project_description column');
    } catch (e) { console.log('ℹ️ project_description column already removed or never existed'); }
    
    try {
      await client.query('ALTER TABLE creator_applications DROP COLUMN IF EXISTS bio');
      console.log('✅ Removed bio column');
    } catch (e) { console.log('ℹ️ bio column already removed or never existed'); }
    
    try {
      await client.query('ALTER TABLE creator_applications DROP COLUMN IF EXISTS experience');
      console.log('✅ Removed experience column');
    } catch (e) { console.log('ℹ️ experience column already removed or never existed'); }
    
    try {
      await client.query('ALTER TABLE creator_applications DROP COLUMN IF EXISTS portfolio');
      console.log('✅ Removed portfolio column');
    } catch (e) { console.log('ℹ️ portfolio column already removed or never existed'); }
    
    console.log('🎉 Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateSchema();
