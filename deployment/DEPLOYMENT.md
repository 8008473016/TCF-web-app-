# Deployment Instructions

Follow these exact steps to cleanly and safely import your products database into Hostinger using the single-file method.

## Step 1: Pull Latest Code
Log into your Hostinger terminal or SSH and pull the latest code:
```bash
git pull origin main
```

## Step 2: Install and Build
Install dependencies and generate the Next.js production build:
```bash
npm install
npm run build
```

## Step 3: Restart Node Application
Restart your running Node.js application (via PM2 or Hostinger control panel) to apply the code changes.

## Step 4: Import SQL to phpMyAdmin
We have consolidated everything into one highly compatible, error-free file.

1. Open **phpMyAdmin** in your Hostinger control panel.
2. Select your TCF database.
3. Click on the **Import** tab.
4. Upload `deployment/full_products_import.sql`.
5. Execute the import.

*Note: This script strictly creates `_new` tables (e.g. `products_new`). It will not break or modify your existing active tables during import.*

## Step 5: Execute Final Rename Commands
Once the import finishes successfully, you can switch the old tables with the new ones.
Run this exact SQL command in the **SQL** tab of phpMyAdmin:

```sql
-- 1. Backup existing tables (if they exist)
RENAME TABLE products TO products_backup;
RENAME TABLE categories TO categories_backup;
RENAME TABLE product_images TO product_images_backup;
RENAME TABLE settings TO settings_backup;

-- 2. Activate the newly imported tables
RENAME TABLE products_new TO products;
RENAME TABLE categories_new TO categories;
RENAME TABLE product_images_new TO product_images;
RENAME TABLE settings_new TO settings;
```

*(If you ever need to rollback, you can simply rename the backup tables back.)*

## Step 6: Verify Images
Visit the live production website and verify that product images load correctly from `/uploads/Products/`.
