import React from 'react';
import type { Metadata } from 'next';
import { RotateCcw, Calendar, Mail, Phone } from 'lucide-react';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | TCF Furniture",
  description: "Review our policies regarding cancellations, refunds, product specifications disclaimer, and damages resolution for furniture orders at TCF.",
};

// Helper to get parsed settings
const getSettings = async () => {
  try {
    const rawSettings = await db.read('settings');
    if (Array.isArray(rawSettings)) {
      const settingsObj: any = {};
      rawSettings.forEach((item: any) => {
        const key = item.Key || item.key;
        const val = item.Value || item.value;
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
    console.error('Error reading settings in Refund Page:', error);
    return {};
  }
};

export default async function RefundPolicyPage() {
  const settings = await getSettings();

  const phone = settings?.contact?.phone || '+91 98765 43210';
  const email = settings?.contact?.email || 'contact@tenalicentralfurniture.com';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-8">
      <div className="bg-white dark:bg-zinc-900 border border-tcf-sand dark:border-zinc-800 p-8 sm:p-10 shadow-premium space-y-6 rounded-2xl">
        {/* Header */}
        <div className="border-b border-tcf-sand dark:border-zinc-800 pb-6 space-y-2">
          <div className="flex items-center gap-3 text-tcf-red dark:text-tcf-gold">
            <RotateCcw className="w-8 h-8" />
            <h1 className="text-4xl font-serif font-black text-tcf-dark dark:text-tcf-light">
              Refund & Cancellation Policy
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tcf-dark/50 dark:text-tcf-light/50 font-medium">
            <Calendar className="w-3.5 h-3.5 text-tcf-gold" />
            <span>Last updated: May 25, 2026</span>
          </div>
        </div>

        {/* Content body */}
        <div className="space-y-6 text-sm text-tcf-dark/80 dark:text-tcf-light/85 leading-relaxed font-light">
          <p>
            We request you to double-check the size of the product as it should serve your need of purchase. Confirm with the space available before placing the order or contact us for more specifications based on your use case.
          </p>

          {/* Return/Exchange Notice */}
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-tcf-red text-tcf-dark dark:text-tcf-light/95 rounded-r">
            <p className="font-medium">
              <span className="font-bold">Note:</span> We do not offer Return/Exchange facility.
            </p>
          </div>

          {/* Product Disclaimer Note */}
          <div className="p-5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 text-tcf-dark dark:text-tcf-light/95 rounded-lg space-y-2">
            <h4 className="font-serif font-bold text-base text-amber-800 dark:text-amber-400">
              Product Disclaimer
            </h4>
            <p className="text-xs sm:text-sm font-light">
              Our teak wood products are handcrafted and made to closely match the reference images displayed on our website. Due to the natural characteristics of wood, variations in grain patterns, color tones, texture, and minor design details may occur.
            </p>
            <p className="text-xs sm:text-sm font-light">
              If the delivered product matches the reference image and specifications by approximately 90% or more, it will be considered as per the accepted standard, and refunds or returns will not be provided based on minor aesthetic differences. We encourage customers to review product details carefully before placing an order.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light">
              Wrong Product Specifications
            </h2>
            <p>
              If you receive the wrong product (wrong size, polish, or other specification), we will replace it with the correct product as per your order. Please register a complaint within <span className="font-semibold text-tcf-red">72 hours of delivery</span>.
            </p>
          </div>

          {/* Damaged products & Resolutions */}
          <div className="space-y-3.5 pt-4">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand/50 dark:border-zinc-800/50 pb-2">
              Damage & Refund Terms
            </h2>
            <ul className="space-y-3 pl-5 list-disc marker:text-tcf-gold">
              <li>
                If the product is damaged, we will assess the issue within 72 hours and decide on a suitable resolution, which may include repair, replacement, or other corrective measures.
              </li>
              <li>
                For minor damages repairable locally, we will reimburse the genuine expenses.
              </li>
              <li>
                For significant damages, we will replace the product.
              </li>
              <li>
                All the refund will be processed and credited within <span className="font-semibold text-tcf-gold text-sm">5 to 7 days</span>.
              </li>
              <li>
                In case of replacement (if approved), It shall be approximately same amount of time as a Freshly manufactured product (Duration : <span className="font-semibold">18 to 30 Days</span>).
              </li>
            </ul>
          </div>

          {/* Cancellation Policy Section */}
          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand/50 dark:border-zinc-800/50 pb-2">
              Cancellation*
            </h2>
            <ul className="space-y-4 pl-5 list-disc marker:text-tcf-gold">
              <li>
                <span className="font-semibold text-tcf-dark dark:text-tcf-light text-base block mb-1">
                  Non-Customized Order Cancellation (Incl. Polish/ Tile change):
                </span>
                <ul className="space-y-1 pl-5 list-circle text-xs sm:text-sm text-tcf-dark/70 dark:text-tcf-light/70">
                  <li>Within 24 Hours: <span className="font-semibold text-tcf-dark dark:text-tcf-light">5% Cancellation Charge</span></li>
                  <li>After 24 Hours: <span className="font-semibold text-tcf-dark dark:text-tcf-light">50% Cancellation Charge</span></li>
                  <li>Shipped: <span className="font-semibold text-tcf-red">100% Cancellation Charge</span></li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-tcf-dark dark:text-tcf-light text-base block mb-1">
                  Customized Order (Made as per specifications given at the time of placing the order):
                </span>
                <ul className="space-y-1 pl-5 list-circle text-xs sm:text-sm text-tcf-dark/70 dark:text-tcf-light/70">
                  <li>Within 24 Hours: <span className="font-semibold text-tcf-dark dark:text-tcf-light">5% Cancellation Charge</span></li>
                  <li>After 24 Hours: <span className="font-semibold text-tcf-dark dark:text-tcf-light">50% Cancellation Charge</span></li>
                  <li>Shipped: <span className="font-semibold text-tcf-red">100% Cancellation Charge</span></li>
                </ul>
              </li>
            </ul>
            
            <p className="text-xs text-tcf-dark/50 dark:text-tcf-light/50 italic pt-1">
              *At our sole discretion
            </p>
            <p className="text-xs text-tcf-dark/75 dark:text-tcf-light/75 font-semibold pt-2">
              Note: Customers can request cancellation with their registered mobile number or email address by contacting us on WhatsApp or Email.
            </p>
          </div>

          {/* Section 3: Contact Info */}
          <div className="pt-6 border-t border-tcf-sand dark:border-zinc-800/80 space-y-3">
            <h3 className="font-serif font-bold text-lg text-tcf-dark dark:text-tcf-light">Contact Support</h3>
            <p>
              To initiate a cancellation, request a refund, or report delivery damage, please reach out with your Order Reference ID and registered phone number:
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
