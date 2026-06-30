import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboardClient } from '../AdminDashboardClient';

export const metadata: Metadata = {
  title: "Admin Dashboard | TCF Control Panel",
  description: "Secure administrative control panel for TCF Furniture catalog management, media uploads, leads logs, and CMS settings.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
