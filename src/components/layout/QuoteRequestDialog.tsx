'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, CheckCircle2, Phone, User, Mail, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';

const leadSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit mobile number.' }).max(15),
  email: z.string().email({ message: 'Please enter a valid email address.' }).or(z.literal('')),
  message: z.string().min(5, { message: 'Requirements message must be at least 5 characters.' }),
  type: z.string(),
  productName: z.string().optional()
});

type LeadFormValues = z.infer<typeof leadSchema>;

export const openQuoteModal = (details?: { name: string; sku?: string }) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('tcf-open-quote-modal', { detail: details });
    window.dispatchEvent(event);
  }
};

export const QuoteRequestDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; sku?: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
      type: 'Quote',
      productName: ''
    }
  });

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; sku?: string }>;
      const details = customEvent.detail;
      
      reset();
      setIsSuccess(false);
      
      if (details) {
        setSelectedProduct(details);
        setValue('productName', details.name);
        setValue('message', `Inquiry for Product: ${details.name} (SKU: ${details.sku || 'N/A'}). I would like to get a quote and details for custom finish/dimensions.`);
      } else {
        setSelectedProduct(null);
        setValue('productName', '');
        setValue('message', '');
      }
      setIsOpen(true);
    };

    window.addEventListener('tcf-open-quote-modal', handleOpen);
    return () => {
      window.removeEventListener('tcf-open-quote-modal', handleOpen);
    };
  }, [reset, setValue]);

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      if (values.email) formData.append('email', values.email);
      formData.append('type', values.type || 'Quote');
      
      let finalMessage = values.message;
      if (selectedProduct) {
        finalMessage = `[PRODUCT: ${selectedProduct.name} - SKU: ${selectedProduct.sku || 'N/A'}] ${values.message}`;
      }
      formData.append('message', finalMessage);

      await axios.post('/api/leads', formData);
      setIsSuccess(true);
      reset();
    } catch (error) {
      console.error('Error submitting quote request:', error);
      alert('There was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-tcf-sand shadow-luxury flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-tcf-sand flex items-center justify-between bg-tcf-light">
          <div>
            <h3 className="text-xl font-serif font-bold text-tcf-dark">
              {selectedProduct ? 'Request Product Quote' : 'Request Free Quote'}
            </h3>
            <p className="text-xs text-tcf-dark/60 mt-1">
              {selectedProduct ? `Inquire about ${selectedProduct.name}` : 'Tell us about your furniture requirements'}
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-tcf-sand/50 text-tcf-dark/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-tcf-dark">Quote Request Received!</h4>
              <p className="text-sm text-tcf-dark/60 max-w-sm">
                Thank you for choosing TCF. Our design experts will review your request and get back to you within 24 hours.
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-6 px-6 py-2.5 bg-tcf-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">
                  Full Name <span className="text-tcf-red">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-tcf-dark/40" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    {...register('name')}
                    className="w-full pl-10 pr-4 py-3 bg-tcf-light border border-tcf-sand text-sm rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark transition-colors"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-tcf-red font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">
                  Phone Number <span className="text-tcf-red">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-tcf-dark/40" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    {...register('phone')}
                    className="w-full pl-10 pr-4 py-3 bg-tcf-light border border-tcf-sand text-sm rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark transition-colors"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-tcf-red font-medium">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">
                  Email Address <span className="text-tcf-dark/40 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-tcf-dark/40" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-3 bg-tcf-light border border-tcf-sand text-sm rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-tcf-red font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 block">
                  Requirements / Customization Notes <span className="text-tcf-red">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-4.5 h-4.5 text-tcf-dark/40" />
                  <textarea
                    rows={4}
                    placeholder="Specify dimensions, wood type, finish, or design preferences..."
                    {...register('message')}
                    className="w-full pl-10 pr-4 py-3 bg-tcf-light border border-tcf-sand text-sm rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark transition-colors resize-none"
                  />
                </div>
                {errors.message && (
                  <p className="text-xs text-tcf-red font-medium">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-tcf-red text-white hover:bg-red-700 disabled:bg-zinc-400 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs shadow-premium transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Requirements
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
