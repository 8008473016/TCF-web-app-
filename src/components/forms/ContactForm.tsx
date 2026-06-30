'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, CheckCircle2, User, Phone, Mail, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit mobile number.' }).max(15),
  email: z.string().email({ message: 'Please enter a valid email address.' }).or(z.literal('')),
  message: z.string().min(5, { message: 'Inquiry message must be at least 5 characters.' })
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: ''
    }
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      if (values.email) formData.append('email', values.email);
      formData.append('type', 'Contact');
      formData.append('message', values.message);

      await axios.post('/api/leads', formData);
      setIsSuccess(true);
      reset();
    } catch (error) {
      console.error('Error submitting contact lead:', error);
      alert('There was an error sending your message. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-tcf-sand p-6 sm:p-8 rounded-2xl shadow-premium">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-tcf-dark font-serif">Message Sent Successfully!</h3>
          <p className="text-sm text-tcf-dark/60 max-w-sm font-light">
            Thank you for reaching out to TCF Furniture. Our team in Tenali will review your inquiry and get in touch with you shortly.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="mt-4 px-6 py-2.5 bg-tcf-red text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-750 transition-colors cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-tcf-dark">Send Us an Inquiry</h3>
            <p className="text-xs text-tcf-dark/50 font-light">We will respond within 24 business hours.</p>
          </div>
          
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
              Mobile Number <span className="text-tcf-red">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-tcf-dark/40" />
              <input
                type="tel"
                placeholder="Enter your 10-digit phone number"
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
              Message <span className="text-tcf-red">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3.5 w-4.5 h-4.5 text-tcf-dark/40" />
              <textarea
                rows={5}
                placeholder="How can we help you? Let us know dimensions, designs, or wood options..."
                {...register('message')}
                className="w-full pl-10 pr-4 py-3 bg-tcf-light border border-tcf-sand text-sm rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark transition-colors resize-none"
              />
            </div>
            {errors.message && (
              <p className="text-xs text-tcf-red font-medium">{errors.message.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-tcf-red text-white hover:bg-red-700 disabled:bg-zinc-400 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs shadow-premium transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
