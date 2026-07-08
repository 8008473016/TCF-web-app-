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

## Step 5: Import Database Seed
We have generated a safe SQL export that inserts and updates the AI-generated products and categories WITHOUT dropping or deleting any existing tables.

1. Open **phpMyAdmin** in your Hostinger control panel.
2. Select your TCF database.
3. Click on the **Import** tab.
4. Upload the `deployment/database_seed.sql` file.
5. Execute the import.

## Step 6: Verify Images
Visit the live production website and verify that product images load correctly.
The database has been configured to load images exclusively from:
`/uploads/Products/`

*Note: The images themselves are not tracked in Git. This relies entirely on the images you have already manually uploaded to the Hostinger File Manager in the `public/uploads/Products` directory.*
