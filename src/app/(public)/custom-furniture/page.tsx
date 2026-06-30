import React from 'react';
import type { Metadata } from 'next';
import { CustomFurnitureClient } from './CustomFurnitureClient';

export const metadata: Metadata = {
  title: "Bespoke Custom Furniture Studio | Handcrafted in Tenali",
  description: "Send us your reference images, floor plans, or sketch notes. TCF experienced artisans will handcraft custom furniture matching your measurements, wood preferences, and finishes.",
  keywords: ["Bespoke Furniture", "Custom Wooden Furniture", "Custom Size Beds", "Handcarved Woodwork Guntur", "Tenali Custom Furniture"],
};

export default function CustomFurniturePage() {
  return <CustomFurnitureClient />;
}
