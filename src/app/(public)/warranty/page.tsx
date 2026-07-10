import React from 'react';
import type { Metadata } from 'next';
import { Shield, Calendar, Mail, Phone } from 'lucide-react';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: "Warranty Policy | TCF Furniture",
  description: "Learn about the TCF warranty coverage, including our solid wood quality guarantee, termite defense, manufacturing warranty, and safe delivery promise.",
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
    console.error('Error reading settings in Warranty Page:', error);
    return {};
  }
};

export default async function WarrantyPolicyPage() {
  const settings = await getSettings();

  const phone = settings?.contact?.phone || '+91 89195 46858';
  const email = settings?.contact?.email || 'contact@tenalicentralfurniture.com';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-8">
      <div className="bg-white dark:bg-zinc-900 border border-tcf-sand dark:border-zinc-800 p-8 sm:p-10 shadow-premium space-y-6 rounded-2xl">
        {/* Header */}
        <div className="border-b border-tcf-sand dark:border-zinc-800 pb-6 space-y-2">
          <div className="flex items-center gap-3 text-tcf-red dark:text-tcf-gold">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl font-serif font-black text-tcf-dark dark:text-tcf-light">
              Warranty Policy
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tcf-dark/50 dark:text-tcf-light/50 font-medium">
            <Calendar className="w-3.5 h-3.5 text-tcf-gold" />
            <span>Last updated: July 10, 2026</span>
          </div>
        </div>

        {/* Content body */}
        <div className="space-y-6 text-sm text-tcf-dark/80 dark:text-tcf-light/85 leading-relaxed font-light">
          <p>
            At Tenali Central Furniture (TCF), we take pride in crafting premium-quality solid wood furniture designed to last for generations. We stand behind our workmanship with comprehensive warranty policies to give you complete peace of mind.
          </p>

          {/* Warranty Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2">
              <h4 className="font-serif font-bold text-base text-amber-800 dark:text-amber-400">
                1-Year Manufacturing Warranty
              </h4>
              <p className="text-xs sm:text-sm font-light">
                Covers any defects in materials, joinery, structural integrity, mechanisms, and upholstery foam.
              </p>
            </div>
            <div className="p-5 bg-red-50/30 dark:bg-red-950/10 border border-tcf-sand dark:border-zinc-800 rounded-xl space-y-2">
              <h4 className="font-serif font-bold text-base text-tcf-red dark:text-tcf-gold">
                Lifetime Termite & Borer Warranty
              </h4>
              <p className="text-xs sm:text-sm font-light">
                Our solid teak wood is fully seasoned and chemically treated to guarantee unmatched protection against termites and borers for life.
              </p>
            </div>
          </div>

          {/* Coverage Details */}
          <div className="space-y-3.5 pt-4">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand/50 dark:border-zinc-800/50 pb-2">
              What is Covered
            </h2>
            <p>
              This warranty strictly covers manufacturing defects in the following structural parts:
            </p>
            <ul className="space-y-2 pl-5 list-disc marker:text-tcf-gold">
              <li>
                <strong>Frame & Structure:</strong> Structural failures, joint separations, or wood cracking/warping under normal usage conditions.
              </li>
              <li>
                <strong>Hardware & Mechanisms:</strong> Drawer runners, hinges, recliner hardware, pneumatic lifts, and other functional parts.
              </li>
              <li>
                <strong>Upholstery Foam:</strong> Excessive sagging or flattening of foam exceeding 1.5 inches within the first year.
              </li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="space-y-3.5 pt-4">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand/50 dark:border-zinc-800/50 pb-2">
              What is Not Covered (Exclusions)
            </h2>
            <ul className="space-y-2 pl-5 list-disc marker:text-tcf-gold">
              <li>
                Upholstery fabrics, seat covers, leatherette, or stitching.
              </li>
              <li>
                Normal wear and tear resulting from daily use (including minor scratches, dents, or finish fading).
              </li>
              <li>
                Damage caused by incorrect cleaning methods, usage of harsh chemicals, or exposure to direct moisture/consistent water.
              </li>
              <li>
                Natural characteristics of wood such as grain patterns, knots, minor color variation, and natural expansion/contraction due to seasonal humidity changes.
              </li>
              <li>
                Damage resulting from improper installation, assembly, modification, or repair performed by unauthorized third parties.
              </li>
              <li>
                Products that have been relocated from their original delivery address.
              </li>
            </ul>
          </div>

          {/* Transit Damage Safe Delivery */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand/50 dark:border-zinc-800/50 pb-2">
              Safe Delivery Promise
            </h2>
            <p>
              We guarantee that your furniture will reach you safely. In the rare event of transit damage:
            </p>
            <ul className="space-y-3 pl-5 list-disc marker:text-tcf-gold">
              <li>
                Please inspect the product at the time of delivery. If you notice any damage, report it to our team on WhatsApp or Email within <span className="font-semibold text-tcf-red">72 hours</span> with photos and a short video showing the damage and the packaging.
              </li>
              <li>
                For minor transit damages, we will coordinate and reimburse the expenses for a local professional carpenter to restore the piece.
              </li>
              <li>
                For major structural transit damages, we will pick up the item and arrange for a complete replacement.
              </li>
            </ul>
          </div>

          {/* Claiming Warranty */}
          <div className="pt-6 border-t border-tcf-sand dark:border-zinc-800/80 space-y-3">
            <h3 className="font-serif font-bold text-lg text-tcf-dark dark:text-tcf-light">How to File a Claim</h3>
            <p>
              To file a warranty claim, please contact our support team with your order reference ID, invoice, and description/images of the issue:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs">
              <a 
                href={`mailto:${email}`}
                className="flex items-center gap-2 p-3 bg-tcf-light dark:bg-zinc-800/40 border border-tcf-sand dark:border-zinc-800 hover:border-tcf-gold transition-colors duration-200 rounded-lg"
              >
                <Mail className="w-4 h-4 text-tcf-gold" />
                <span>{email}</span>
              </a>
              <a 
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 p-3 bg-tcf-light dark:bg-zinc-800/40 border border-tcf-sand dark:border-zinc-800 hover:border-tcf-gold transition-colors duration-200 rounded-lg"
              >
                <Phone className="w-4 h-4 text-tcf-gold" />
                <span>{phone}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
