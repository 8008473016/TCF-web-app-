import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: "Contact Our Showroom | TCF Tenali",
  description: "Get in touch with Tenali Central Furniture (TCF). View our physical showroom address, phone numbers, hours of operation, and submit customized quotes requests.",
};

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
    console.error('Error reading settings in Contact Page:', error);
    return {};
  }
};

export default async function ContactPage() {
  const settings = await getSettings();

  const phone = settings?.contact?.phone || '+91 98765 43210';
  const email = settings?.contact?.email || 'contact@tenalicentralfurniture.com';
  const whatsapp = settings?.contact?.whatsapp || 'https://wa.me/919876543210';
  const address = settings?.contact?.address || 'Opp R.C.M Chruch, Amaravathi yards,Chenchupet, Tenali,Andhra pradesh 522202';
  const hours = settings?.contact?.hours || '09:00 AM - 09:00 PM Daily';

  return (
    <div className="bg-tcf-light min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.25em]">Get in Touch</span>
          <h1 className="text-4xl font-serif font-black text-tcf-dark leading-tight">
            Connect With Our Design Team
          </h1>
          <p className="text-sm text-tcf-dark/70 leading-relaxed font-light">
            Inquire about pricing, custom dimensions, timber options, or schedule a physical showroom visit in Tenali.
          </p>
          <div className="w-16 h-0.5 bg-tcf-red mx-auto mt-6" />
        </div>

        {/* Contact Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Showroom Details Column */}
          <div className="lg:col-span-5 space-y-8 bg-zinc-100 border border-tcf-sand p-8 rounded-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-tcf-dark">TCF Showroom</h2>
              <p className="text-xs text-tcf-dark/60 font-light">Visit our seasoned wood yard to view wood blocks and catalogs.</p>
            </div>

            <div className="space-y-6 text-sm text-tcf-dark/80">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-tcf-sand flex items-center justify-center text-tcf-red flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-tcf-dark">Physical Location</h4>
                  <p className="text-xs text-tcf-dark/70 mt-1 leading-relaxed font-light">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-tcf-sand flex items-center justify-center text-tcf-red flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-tcf-dark">Call Direct</h4>
                  <p className="text-xs text-tcf-dark/70 mt-1 font-light">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-tcf-sand flex items-center justify-center text-tcf-red flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-tcf-dark">Email Contact</h4>
                  <p className="text-xs text-tcf-dark/70 mt-1 font-light">{email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-tcf-sand flex items-center justify-center text-tcf-red flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-tcf-dark">Showroom Hours</h4>
                  <p className="text-xs text-tcf-dark/70 mt-1 font-semibold">{hours}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="pt-6 border-t border-tcf-sand/80 flex flex-col sm:flex-row gap-4">
              <a 
                href={`tel:${phone}`}
                className="flex-1 py-3 bg-tcf-red hover:bg-red-750 text-white text-center text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> Call Showroom
              </a>
              <a 
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Team
              </a>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* Embedded Map Section */}
        <section className="bg-white border border-tcf-sand/80 p-4 rounded-3xl shadow-premium overflow-hidden">
          <div className="relative w-full h-[400px] overflow-hidden rounded-2xl bg-tcf-light">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.497551787265!2d80.6304628!3d16.2399363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a0759417d3cf9%3A0x34b835ae6719448e!2sTENALI+CENTRAL+FURNITURES!5e0!3m2!1sen!2sin!4v1719580000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
