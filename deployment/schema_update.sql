-- Run this script BEFORE importing database_seed.sql
-- This will ensure your Hostinger production database has the new AI tracking columns

-- Add ai_generated boolean column if it doesn't exist
-- We use a safe stored procedure to check if the column exists before adding it to avoid errors.

DELIMITER //

CREATE PROCEDURE AddColumnsIfNotExist()
BEGIN
    -- Check for ai_generated
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'ai_generated'
    ) THEN
        ALTER TABLE products ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    END IF;

    -- Check for ai_generated_at
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'ai_generated_at'
    ) THEN
        ALTER TABLE products ADD COLUMN ai_generated_at DATETIME;
    END IF;
END //

DELIMITER ;

CALL AddColumnsIfNotExist();
DROP PROCEDURE AddColumnsIfNotExist;
