import React from 'react';
import type { Metadata } from 'next';
import { Shield, Calendar, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: "Privacy Policy | TCF Furniture",
  description: "Learn how Tenali Central Furniture (TCF) collects, processes, and protects your personal information in accordance with privacy regulations.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-8">
      <div className="bg-white dark:bg-zinc-900 border border-tcf-sand dark:border-zinc-800 p-8 sm:p-10 shadow-premium space-y-6 rounded-2xl">
        {/* Header */}
        <div className="border-b border-tcf-sand dark:border-zinc-800 pb-6 space-y-2">
          <div className="flex items-center gap-3 text-tcf-red dark:text-tcf-gold">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl font-serif font-black text-tcf-dark dark:text-tcf-light">
              Privacy Policy
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
            Tenali Central Furniture (TCF) operates this store and website, including all related information, content, features, tools, products, and services, in order to provide you, the customer, with a curated shopping experience (the &quot;Services&quot;). This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, and make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.
          </p>

          <p>
            Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.
          </p>

          {/* Section 1 */}
          <div className="space-y-3 pt-4">
            <h2 className="text-2xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand/50 dark:border-zinc-800/50 pb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-tcf-gold" />
              Personal Information We Collect or Process
            </h2>
            <p>
              When we use the term &quot;personal information,&quot; we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:
            </p>

            <ul className="space-y-3.5 pl-5 list-disc marker:text-tcf-gold">
              <li>
                <span className="font-semibold text-tcf-dark dark:text-tcf-light">Contact details</span> including your name, address, billing address, shipping address, phone number, and email address.
              </li>
              <li>
                <span className="font-semibold text-tcf-dark dark:text-tcf-light">Communications with us</span> including the information you include in communications with us, for example, when sending a customer support inquiry.
              </li>
              <li>
                <span className="font-semibold text-tcf-dark dark:text-tcf-light">Device information</span> including information about your device, browser, or network connection, your IP address, and other unique identifiers.
              </li>
              <li>
                <span className="font-semibold text-tcf-dark dark:text-tcf-light">Usage information</span> including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
