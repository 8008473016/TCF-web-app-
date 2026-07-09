# Deployment Instructions

Follow these steps exactly to safely deploy the new TCF Furniture application and database updates to Hostinger.

## Step 1: Pull Latest Code
Log into your Hostinger terminal or SSH and navigate to your project directory. Pull the latest source code from GitHub:
```bash
git pull origin main
```

## Step 2: Install Dependencies
Install any new dependencies required by the updated project:
```bash
npm install
```

## Step 3: Build the Project
Generate the optimized production build for Next.js:
```bash
npm run build
```

## Step 4: Restart Node Application
Restart the running Node.js application (via PM2, Hostinger control panel, or your specific process manager) to apply the code changes:
```bash
pm2 restart tcf-web-app
# OR restart via Hostinger dashboard
```

## Step 5: Update Database Schema
We need to ensure your Hostinger database has the correct new columns for AI tracking before importing the data.

1. Open **phpMyAdmin** in your Hostinger control panel.
2. Select your TCF database.
3. Click on the **Import** tab.
4. Upload the `deployment/schema_update.sql` file and execute it.

## Step 6: Import Database Seed
Now that the schema is updated, we can safely import the AI-generated data.

1. Still in phpMyAdmin, click on the **Import** tab again.
2. Upload the `deployment/database_seed.sql` file.
3. Execute the import.

## Step 7: Verify Images
Visit the live production website and verify that product images load correctly.
The database has been configured to load images exclusively from:
`/uploads/Products/`

*Note: The images themselves are not tracked in Git. This relies entirely on the images you have already manually uploaded to the Hostinger File Manager in the `public/uploads/Products` directory.*
