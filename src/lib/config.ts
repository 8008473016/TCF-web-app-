export const config = {
  adminSecret: process.env.ADMIN_SECRET || 'TCFAdminMaster2026',
  google: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    sheetId: process.env.GOOGLE_SHEET_ID || '',
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  }
};

export const isGoogleConfigured = !!(
  config.google.serviceAccountEmail &&
  config.google.privateKey &&
  config.google.sheetId
);
