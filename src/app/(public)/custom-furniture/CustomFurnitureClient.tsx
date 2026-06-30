'use client';

import React, { useState } from 'react';
import { Hammer, Image as ImageIcon, FileText, Compass, Send, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

export const CustomFurnitureClient: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [material, setMaterial] = useState('Teak Wood');
  const [finish, setFinish] = useState('Natural Polish');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  
  // File uploads
  const [referenceImages, setReferenceImages] = useState<FileList | null>(null);
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [roomPhoto, setRoomPhoto] = useState<File | null>(null);

  const materials = ['Teak Wood', 'Sheesham Wood', 'Mango Wood', 'Mahogany Wood', 'Rosewood'];
  const finishes = ['Natural Polish', 'Honey Glaze', 'Rich Walnut', 'Dark Mahogany', 'Antique Distressed', 'Solid Painted Black/White'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ref' | 'floor' | 'room') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'ref') {
        setReferenceImages(e.target.files);
      } else if (type === 'floor') {
        setFloorPlan(e.target.files[0]);
      } else if (type === 'room') {
        setRoomPhoto(e.target.files[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill in your Name and Phone Number.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'CustomFurniture');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('message', message);
      formData.append('material', material);
      formData.append('finish', finish);
      formData.append('dimensions', `L: ${length || '-'} x W: ${width || '-'} x H: ${height || '-'} in`);

      // Append files if selected
      if (referenceImages) {
        for (let i = 0; i < referenceImages.length; i++) {
          formData.append('referenceImages', referenceImages[i]);
        }
      }
      if (floorPlan) {
        formData.append('floorPlan', floorPlan);
      }
      if (roomPhoto) {
        formData.append('roomPhoto', roomPhoto);
      }

      const response = await axios.post('/api/leads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessMsg(`Quotation Request Registered! Reference ID: ${response.data.leadId}`);
        setStep(4);
      }
    } catch (error) {
      console.error('Error submitting custom quote:', error);
      alert('Failed to register request. You can also send drawings directly to us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-10">
      
      {/* Header section */}
      <div className="text-center space-y-4 bg-white dark:bg-zinc-900 border border-tcf-sand dark:border-zinc-800 p-8 shadow-premium rounded-2xl">
        <div className="p-4 bg-tcf-light dark:bg-zinc-800 rounded-full text-tcf-red w-fit mx-auto border border-tcf-sand dark:border-zinc-800">
          <Hammer className="w-8 h-8 text-tcf-red dark:text-tcf-gold" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-tcf-dark dark:text-tcf-light">
          Bespoke Custom Furniture Studio
        </h1>
        <p className="text-sm text-tcf-dark/70 dark:text-tcf-light/75 max-w-xl mx-auto leading-relaxed font-light">
          Have a unique design in mind or need furniture tailored to fit specific room niches? Describe your requirements, upload design files, and receive a free price quotation from TCF.
        </p>
      </div>

      {/* Form Steps Indicator */}
      <div className="flex justify-between items-center max-w-md mx-auto px-4">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                step >= num 
                  ? 'bg-tcf-red border-tcf-red text-white dark:bg-tcf-gold dark:border-tcf-gold dark:text-tcf-dark' 
                  : 'bg-white dark:bg-zinc-900 border-tcf-sand dark:border-zinc-800 text-tcf-dark/40 dark:text-tcf-light/40'
              }`}>
                {num}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${step >= num ? 'text-tcf-red dark:text-tcf-gold' : 'text-tcf-dark/40 dark:text-tcf-light/40'}`}>
                {num === 1 ? 'Design & Files' : num === 2 ? 'Dimensions & Wood' : 'Contact Details'}
              </span>
            </div>
            {num < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > num ? 'bg-tcf-red dark:bg-tcf-gold' : 'bg-tcf-sand dark:bg-zinc-800'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Main stepper form box */}
      <div className="bg-white dark:bg-zinc-900 border border-tcf-sand dark:border-zinc-800 p-6 sm:p-10 shadow-premium rounded-2xl">
        
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand dark:border-zinc-800 pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-tcf-red dark:text-tcf-gold" /> Step 1: Upload Reference Drawings & Images
            </h2>

            {/* Reference image list */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Reference Images (up to 5 pictures / sketches)
              </label>
              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'ref')}
                className="w-full text-xs text-tcf-dark dark:text-tcf-light/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-tcf-sand dark:file:border-zinc-850 file:text-xs file:font-semibold file:bg-tcf-light dark:file:bg-zinc-800 file:text-tcf-red dark:file:text-tcf-gold file:cursor-pointer hover:file:bg-tcf-sand"
              />
              {referenceImages && (
                <p className="text-[10px] text-green-600 font-semibold">{referenceImages.length} files selected.</p>
              )}
            </div>

            {/* Floor plan list */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Floor Plan or Architectural Layout (pdf / dwg / image)
              </label>
              <input 
                type="file" 
                accept="image/*,.pdf,.dwg"
                onChange={(e) => handleFileChange(e, 'floor')}
                className="w-full text-xs text-tcf-dark dark:text-tcf-light/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-tcf-sand dark:file:border-zinc-850 file:text-xs file:font-semibold file:bg-tcf-light dark:file:bg-zinc-800 file:text-tcf-red dark:file:text-tcf-gold file:cursor-pointer hover:file:bg-tcf-sand"
              />
              {floorPlan && (
                <p className="text-[10px] text-green-600 font-semibold">Selected: {floorPlan.name}</p>
              )}
            </div>

            {/* Room photos list */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Current Room Photo (to check wall colors and space aesthetic)
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'room')}
                className="w-full text-xs text-tcf-dark dark:text-tcf-light/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-tcf-sand dark:file:border-zinc-850 file:text-xs file:font-semibold file:bg-tcf-light dark:file:bg-zinc-800 file:text-tcf-red dark:file:text-tcf-gold file:cursor-pointer hover:file:bg-tcf-sand"
              />
              {roomPhoto && (
                <p className="text-[10px] text-green-600 font-semibold">Selected: {roomPhoto.name}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-tcf-red text-white hover:bg-red-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-premium rounded-lg cursor-pointer"
              >
                Next Step: Dimensions & Material
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand dark:border-zinc-800 pb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-tcf-red dark:text-tcf-gold" /> Step 2: Custom Dimensions & Wood Materials
            </h2>

            {/* Dimensions fields */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Required Dimensions (in inches)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-tcf-dark/50 dark:text-white/40 font-semibold uppercase">Length</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 72" 
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark dark:text-tcf-light"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-tcf-dark/50 dark:text-white/40 font-semibold uppercase">Width / Depth</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 36" 
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark dark:text-tcf-light"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-tcf-dark/50 dark:text-white/40 font-semibold uppercase">Height</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 30" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark dark:text-tcf-light"
                  />
                </div>
              </div>
            </div>

            {/* Timber wood selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Wood Material
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {materials.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(m)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-300 cursor-pointer ${
                      material === m 
                        ? 'bg-tcf-red border-tcf-red text-white dark:bg-tcf-gold dark:border-tcf-gold dark:text-tcf-dark' 
                        : 'bg-white dark:bg-zinc-905 border-tcf-sand dark:border-zinc-800 text-tcf-dark dark:text-tcf-light/70 hover:border-tcf-gold'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Polish Finish
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {finishes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFinish(f)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-300 cursor-pointer ${
                      finish === f 
                        ? 'bg-tcf-red border-tcf-red text-white dark:bg-tcf-gold dark:border-tcf-gold dark:text-tcf-dark' 
                        : 'bg-white dark:bg-zinc-905 border-tcf-sand dark:border-zinc-800 text-tcf-dark dark:text-tcf-light/70 hover:border-tcf-gold'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 border border-tcf-sand dark:border-zinc-800 hover:bg-tcf-light dark:hover:bg-zinc-800 text-tcf-dark dark:text-tcf-light/80 font-semibold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Previous Step
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-tcf-red text-white hover:bg-red-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-premium rounded-lg cursor-pointer"
              >
                Next Step: Contact Details
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-tcf-dark dark:text-tcf-light border-b border-tcf-sand dark:border-zinc-800 pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-tcf-red dark:text-tcf-gold" /> Step 3: Patron Contact Details & Special Notes
            </h2>

            {/* Customer Details fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark dark:text-tcf-light"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Enter phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red font-mono text-tcf-dark dark:text-tcf-light"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark dark:text-tcf-light"
                />
              </div>
            </div>

            {/* Notes description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-tcf-dark/70 dark:text-white/70 block">
                Additional Notes & Specifications
              </label>
              <textarea 
                rows={4}
                placeholder="Include details about cushion fabric color, extra drawers, specific handles or brass carvings you wish to request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-tcf-sand dark:border-zinc-800 bg-tcf-light dark:bg-zinc-950 text-xs rounded-lg focus:outline-none focus:border-tcf-red text-tcf-dark dark:text-tcf-light"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 border border-tcf-sand dark:border-zinc-800 hover:bg-tcf-light dark:hover:bg-zinc-800 text-tcf-dark dark:text-tcf-light/80 font-semibold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Previous Step
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-tcf-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-premium disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {loading ? 'Uploading Files...' : 'Submit Quotation Request'} <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="text-center p-8 space-y-6 max-w-md mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-black text-tcf-dark dark:text-tcf-light">
                Request Registered Successfully!
              </h2>
              <p className="text-sm text-tcf-dark/70 dark:text-tcf-light/70 font-light leading-relaxed">
                {successMsg}
              </p>
            </div>
            
            <div className="p-4 bg-tcf-light dark:bg-zinc-950 border border-tcf-sand dark:border-zinc-800 text-xs flex items-center gap-3 rounded-xl">
              <Clock className="w-5 h-5 text-tcf-gold flex-shrink-0" />
              <p className="text-left leading-normal text-tcf-dark/80 dark:text-tcf-light/80">
                Our bespoke design consultant will review your uploads and email/call you within **24 hours** with a rough quotation and hand-drawn layout concepts.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setMessage('');
                  setLength('');
                  setWidth('');
                  setHeight('');
                  setReferenceImages(null);
                  setFloorPlan(null);
                  setRoomPhoto(null);
                  setSuccessMsg(null);
                }}
                className="flex-1 py-2.5 border border-tcf-red dark:border-tcf-gold text-tcf-red dark:text-tcf-gold hover:bg-tcf-red dark:hover:bg-tcf-gold hover:text-white dark:hover:text-tcf-dark transition-colors font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Create New Request
              </button>
              <a
                href="https://wa.me/919876543210?text=Hi%20TCF!%20I%20just%20submitted%20a%20custom%20furniture%20quote%20request%20on%20your%2520website."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
