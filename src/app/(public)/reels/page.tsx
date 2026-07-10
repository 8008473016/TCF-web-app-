import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ReelsClient } from './ReelsClient';

export const metadata: Metadata = {
  title: "TCF Showcase Reels | Premium Tenali Furniture Walkthroughs",
  description: "Watch our solid teak wood furniture designs being handcrafted in our Tenali workshop. Experience design details, walkthroughs, and custom works.",
  keywords: ["Tenali Furniture Reels", "TCF Video Showcase", "Furniture Custom Video", "Tenali Central Furniture Workshop"]
};

// Helper to get parsed settings
const getSettings = async () => {
  try {
    const rawSettings = await db.read('settings');
    if (Array.isArray(rawSettings)) {
      const settingsObj: any = {};
      rawSettings.forEach((item: any) => {
        const key = item.Key || item.key || item.setting_key;
        const val = item.Value || item.value || item.setting_value;
        if (key) {
          try {
            settingsObj[key] = JSON.parse(val);
          } catch {
            settingsObj[key] = val;
          }
        }
      });
      return settingsObj;
    }
    return rawSettings || {};
  } catch (error) {
    console.error('Error reading settings in Reels Page:', error);
    return {};
  }
};

export default async function ReelsPage() {
  const settings = await getSettings();
  const reels = settings?.reels || [];

  return <ReelsClient reels={reels} />;
}
