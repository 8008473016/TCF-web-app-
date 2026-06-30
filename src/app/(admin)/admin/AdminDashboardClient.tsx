'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Shield, LayoutDashboard, ShoppingBag, Hammer, Settings, LogOut, 
  Plus, Edit, Trash, Save, Eye, Search, Upload, RefreshCw, X, Loader2,
  Image as ImageIcon, Copy, ArrowUp, ArrowDown, Download, Check, 
  Archive, RotateCcw, AlertTriangle, HelpCircle, CheckCircle2, 
  ChevronRight, ChevronDown, Calendar, FileText, Globe, BarChart3, 
  Users, Star, MapPin, Mail, Clock, PlusCircle, CheckSquare, 
  FolderPlus, Folder, Trash2, Heart, ExternalLink, HelpCircle as FaqIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore, api } from '@/hooks/useAuthStore';
import { useProductStore } from '@/hooks/useProductStore';

const woodMaterials = ['Teak Wood', 'Sheesham Wood', 'Mango Wood', 'Mahogany Wood', 'Rosewood'];

type MainTab = 
  | 'dashboard'
  | 'website'
  | 'products'
  | 'content'
  | 'media'
  | 'leads'
  | 'marketing'
  | 'analytics'
  | 'settings';

type SubTab = 
  // Website
  | 'web-homepage' | 'web-pages'
  // Products
  | 'prod-catalog' | 'prod-categories' | 'prod-collections' | 'prod-brands'
  // Leads
  | 'leads-contacts' | 'leads-quotes' | 'leads-callbacks'
  // Marketing
  | 'mkt-seo' | 'mkt-sitemap' | 'mkt-redirects'
  // Settings
  | 'set-business' | 'set-integrations' | 'set-backups' | 'set-users';

type ProductTab = 'general' | 'seo' | 'gallery' | 'specifications' | 'related' | 'visibility' | 'analytics' | 'preview';

type HomepageSection = 'hero' | 'categories' | 'why-us' | 'bestsellers' | 'featured' | 'gallery' | 'testimonials' | 'faq' | 'footer';

export const AdminDashboardClient: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const { categories, fetchCategories } = useProductStore();

  // Navigation states
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('web-homepage');
  const [activeHomeSection, setActiveHomeSection] = useState<HomepageSection>('hero');

  // Sidebar expand/collapse categories
  const [expandedMenus, setExpandedMenus] = useState({
    website: true,
    products: true,
    leads: true,
    marketing: true,
    settings: true,
  });

  const toggleMenu = (menu: keyof typeof expandedMenus) => {
    setExpandedMenus({ ...expandedMenus, [menu]: !expandedMenus[menu] });
  };

  // Database states
  const [products, setProducts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [cmsSettings, setCmsSettings] = useState<any | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productArchiveFilter, setProductArchiveFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFolderFilter, setMediaFolderFilter] = useState('all');

  // --- Product Manager (Shopify-style Form States) ---
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<ProductTab>('general');
  const [productForm, setProductForm] = useState({
    id: '', sku: '', name: '', slug: '', category: '', description: '',
    price: 0, salePrice: '', stock: 1, material: 'Teak Wood', dimensions: '', weight: 0,
    images: [] as string[], featured: false, archived: false,
    seoTitle: '', seoDescription: '', seoKeywords: '', canonicalUrl: '',
    specifications: [] as { label: string; value: string }[],
    relatedProducts: [] as string[]
  });

  // Dynamic spec state
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Media Library Dialog Selector (Wordpress-style picker)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'product-gallery' | 'cms-banner' | 'media-replace' | null>(null);
  const [bannerPickerIndex, setBannerPickerIndex] = useState<number | null>(null);

  // Media CRUD state
  const [editingMedia, setEditingMedia] = useState<any | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFormAlt, setMediaFormAlt] = useState('');
  const [mediaSelectedFolder, setMediaSelectedFolder] = useState('/general');
  const [bulkSelectMedia, setBulkSelectMedia] = useState<string[]>([]);

  // Categories CRUD state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', slug: '', description: '', banner: '' });

  // Lead coordinator logs modal
  const [viewingLead, setViewingLead] = useState<any | null>(null);
  const [leadNotesText, setLeadNotesText] = useState('');

  // Backup & Import states
  const [backupFile, setBackupFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchAllAdminData();
    }
  }, [isAuthenticated]);

  const fetchAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, leadsRes, mediaRes, cmsRes, statsRes] = await Promise.all([
        api.get('/products?archived=true'),
        api.get('/leads'),
        api.get('/media'),
        api.get('/cms'),
        api.get('/analytics/stats')
      ]);
      setProducts(productsRes.data);
      setLeads(leadsRes.data);
      setMediaItems(mediaRes.data);
      setCmsSettings(cmsRes.data);
      setAnalyticsStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // --- Actions ---

  // Product Duplication
  const handleDuplicateProduct = async (product: any) => {
    const duplicated = {
      id: `PROD${Date.now()}`,
      sku: `${product.sku}-copy`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy`,
      category: product.category,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      stock: product.stock,
      material: product.material,
      dimensions: product.dimensions,
      weight: product.weight,
      images: [...(product.images || [])],
      featured: false,
      archived: false,
      seoTitle: product.seoTitle ? `${product.seoTitle} Copy` : '',
      seoDescription: product.seoDescription || '',
      specifications: [...(product.specifications || [])],
      relatedProducts: [...(product.relatedProducts || [])]
    };
    try {
      await api.post('/products', duplicated);
      fetchAllAdminData();
      alert('Product duplicated successfully!');
    } catch {
      alert('Failed to duplicate product.');
    }
  };

  const handleArchiveProduct = async (id: string, archiveStatus: boolean) => {
    try {
      await api.put(`/products/${id}`, { archived: archiveStatus });
      fetchAllAdminData();
      alert(`Product ${archiveStatus ? 'archived' : 'restored'} successfully!`);
    } catch {
      alert('Failed to update product archive status.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Permanently delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchAllAdminData();
    } catch {
      alert('Failed to delete product.');
    }
  };

  // Categories CRUD Handlers
  const handleOpenCategoryModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        id: category.id,
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        banner: category.banner || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        id: `CAT${Date.now()}`,
        name: '',
        slug: '',
        description: '',
        banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) return;
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
        alert('Category updated successfully!');
      } else {
        await api.post('/categories', categoryForm);
        alert('Category added successfully!');
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch {
      alert(editingCategory ? 'Failed to update category.' : 'Failed to add category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? This might affect existing products.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
      alert('Category deleted successfully.');
    } catch {
      alert('Failed to delete category.');
    }
  };

  // Product Modal Open/Save
  const handleOpenProductModal = (product: any = null) => {
    setActiveProductTab('general');
    if (product) {
      setEditingProduct(product);
      setProductForm({
        id: product.id,
        sku: product.sku || '',
        name: product.name || '',
        slug: product.slug || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || 0,
        salePrice: product.salePrice !== null ? String(product.salePrice) : '',
        stock: product.stock !== undefined ? product.stock : 1,
        material: product.material || 'Teak Wood',
        dimensions: product.dimensions || '',
        weight: product.weight || 0,
        images: Array.isArray(product.images) ? [...product.images] : [],
        featured: !!product.featured,
        archived: !!product.archived,
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || '',
        canonicalUrl: product.canonicalUrl || '',
        specifications: Array.isArray(product.specifications) ? [...product.specifications] : [],
        relatedProducts: Array.isArray(product.relatedProducts) ? [...product.relatedProducts] : []
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        id: `PROD${Date.now()}`,
        sku: '',
        name: '',
        slug: '',
        category: categories[0]?.slug || 'sofas',
        description: '',
        price: 0,
        salePrice: '',
        stock: 1,
        material: 'Teak Wood',
        dimensions: '',
        weight: 0,
        images: [],
        featured: false,
        archived: false,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        canonicalUrl: '',
        specifications: [],
        relatedProducts: []
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      salePrice: productForm.salePrice.trim() ? Number(productForm.salePrice) : null,
      stock: Number(productForm.stock),
      weight: Number(productForm.weight),
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsProductModalOpen(false);
      fetchAllAdminData();
      alert('Product saved successfully.');
    } catch {
      alert('Failed to save product.');
    }
  };

  // Specifications helpers
  const addSpecField = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setProductForm({
      ...productForm,
      specifications: [...productForm.specifications, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]
    });
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const removeSpecField = (idx: number) => {
    const list = productForm.specifications.filter((_, i) => i !== idx);
    setProductForm({ ...productForm, specifications: list });
  };

  // Media Library helpers
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingMedia(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name.split('.')[0]);
        // Support folders
        formData.append('folder', mediaSelectedFolder);

        await api.post('/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchAllAdminData();
      alert('Images uploaded successfully!');
    } catch {
      alert('Failed to upload some assets.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await api.delete(`/media/${id}`);
      setEditingMedia(null);
      fetchAllAdminData();
    } catch {
      alert('Failed to delete media.');
    }
  };

  const handleBulkDeleteMedia = async () => {
    if (bulkSelectMedia.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${bulkSelectMedia.length} selected images?`)) return;
    try {
      for (const id of bulkSelectMedia) {
        await api.delete(`/media/${id}`);
      }
      setBulkSelectMedia([]);
      fetchAllAdminData();
      alert('Bulk deletion complete.');
    } catch {
      alert('Error during bulk deletion.');
    }
  };

  const handleReplaceMediaAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMedia) return;
    setUploadingMedia(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', editingMedia.alt || file.name.split('.')[0]);

    try {
      // 1. Upload new image to get URL
      const uploadRes = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = uploadRes.data.url;

      // 2. Put call to replace old URL globally
      await api.put(`/media/${editingMedia.id}`, {
        alt: editingMedia.alt,
        oldUrl: editingMedia.url,
        newUrl: newUrl
      });

      // 3. Delete old media record
      await api.delete(`/media/${editingMedia.id}`);

      setEditingMedia(null);
      fetchAllAdminData();
      alert('Asset replaced globally across products and sliders!');
    } catch (err) {
      console.error(err);
      alert('Failed to replace media asset.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleUpdateMediaAlt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    try {
      await api.put(`/media/${editingMedia.id}`, {
        alt: mediaFormAlt
      });
      setEditingMedia(null);
      fetchAllAdminData();
      alert('Media alt text updated successfully!');
    } catch {
      alert('Failed to update media alt text.');
    }
  };

  // Leads update notes
  const handleUpdateLeadNotes = async () => {
    if (!viewingLead) return;
    try {
      await api.put(`/leads/${viewingLead.leadId}`, { staffNotes: leadNotesText });
      setViewingLead(null);
      fetchAllAdminData();
      alert('Coordinator log updated.');
    } catch {
      alert('Failed to update notes.');
    }
  };

  const openLeadNotesModal = (l: any) => {
    setViewingLead(l);
    setLeadNotesText(l.staffNotes || '');
  };

  const selectMediaItem = (url: string) => {
    if (mediaPickerTarget === 'product-gallery') {
      setProductForm({
        ...productForm,
        images: [...productForm.images, url]
      });
    } else if (mediaPickerTarget === 'cms-banner' && bannerPickerIndex !== null && cmsSettings) {
      const list = [...cmsSettings.banners];
      list[bannerPickerIndex].image = url;
      setCmsSettings({ ...cmsSettings, banners: list });
    }
    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
    setBannerPickerIndex(null);
  };

  const moveImage = (idx: number, dir: 'up' | 'down') => {
    const list = [...productForm.images];
    if (dir === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (dir === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }
    setProductForm({ ...productForm, images: list });
  };

  const removeProductImage = (idx: number) => {
    const list = productForm.images.filter((_, i) => i !== idx);
    setProductForm({ ...productForm, images: list });
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      await api.put(`/leads/${leadId}`, { status });
      fetchAllAdminData();
      alert('Lead status updated successfully.');
    } catch {
      alert('Failed to update lead status.');
    }
  };

  const exportLeadsCSV = () => {
    if (leads.length === 0) {
      alert('No leads available to export.');
      return;
    }
    const headers = ['Lead ID', 'Type', 'Name', 'Email', 'Phone', 'Message', 'Status', 'Staff Notes', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...leads.map((l: any) => [
        `"${l.leadId || ''}"`,
        `"${l.type || ''}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${(l.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${l.status || ''}"`,
        `"${(l.staffNotes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${l.createdAt || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tcf_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveCmsSettings = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!cmsSettings) return;
    try {
      await api.put('/cms', cmsSettings);
      alert('CMS settings saved successfully!');
      fetchAllAdminData();
    } catch {
      alert('Failed to save CMS settings.');
    }
  };

  const addHeroBanner = () => {
    if (!cmsSettings) return;
    const newBanner = {
      id: `banner-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=80',
      title: 'New Slider Headline',
      subtitle: 'Luxury seasoned solid wood',
      ctaText: 'Explore',
      ctaLink: '/products'
    };
    setCmsSettings({ ...cmsSettings, banners: [...(cmsSettings.banners || []), newBanner] });
  };

  const removeHeroBanner = (idx: number) => {
    if (!cmsSettings) return;
    const list = cmsSettings.banners.filter((_: any, i: number) => i !== idx);
    setCmsSettings({ ...cmsSettings, banners: list });
  };

  const addFAQ = () => {
    if (!cmsSettings) return;
    const newFAQ = {
      id: `faq-${Date.now()}`,
      question: 'New Question?',
      answer: 'Answer text here.',
      category: 'General'
    };
    setCmsSettings({ ...cmsSettings, faqs: [...(cmsSettings.faqs || []), newFAQ] });
  };

  const removeFAQ = (id: string) => {
    if (!cmsSettings) return;
    const list = cmsSettings.faqs.filter((f: any) => f.id !== id);
    setCmsSettings({ ...cmsSettings, faqs: list });
  };

  const addTestimonial = () => {
    if (!cmsSettings) return;
    const newTest = {
      id: `test-${Date.now()}`,
      name: 'Client Name',
      rating: 5,
      quote: 'Excellent furniture carvings.',
      date: new Date().toISOString().split('T')[0]
    };
    setCmsSettings({ ...cmsSettings, testimonials: [...(cmsSettings.testimonials || []), newTest] });
  };

  const removeTestimonial = (id: string) => {
    if (!cmsSettings) return;
    const list = cmsSettings.testimonials.filter((t: any) => t.id !== id);
    setCmsSettings({ ...cmsSettings, testimonials: list });
  };

  // Backup & Import
  const handleBackupExport = async () => {
    try {
      const res = await api.get('/backup');
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tcf_cms_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Export failed.');
    }
  };

  const handleBackupImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupFile) return;
    if (!window.confirm('WARNING: Importing a backup will overwrite the entire database. Proceed?')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        await api.post('/backup', { data: parsed });
        alert('Database restored successfully! Reloading...');
        fetchAllAdminData();
      } catch (err) {
        alert('Failed to restore backup. Invalid format.');
      }
    };
    reader.readAsText(backupFile);
  };

  // Computed Lists
  const filteredProductsList = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      const matchesArchive = productArchiveFilter === 'all' 
        || (productArchiveFilter === 'active' && !p.archived)
        || (productArchiveFilter === 'archived' && p.archived);
      return matchesSearch && matchesCategory && matchesArchive;
    });
  }, [products, productSearch, productCategoryFilter, productArchiveFilter]);

  const filteredLeadsList = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.name?.toLowerCase().includes(leadSearch.toLowerCase()) || l.phone?.includes(leadSearch) || l.leadId?.toLowerCase().includes(leadSearch.toLowerCase());
      const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  const filteredMediaList = useMemo(() => {
    return mediaItems.filter(m => {
      const matchesSearch = m.filename?.toLowerCase().includes(mediaSearch.toLowerCase()) || m.alt?.toLowerCase().includes(mediaSearch.toLowerCase());
      const matchesFolder = mediaFolderFilter === 'all' || (m.folder || '/general') === mediaFolderFilter;
      return matchesSearch && matchesFolder;
    });
  }, [mediaItems, mediaSearch, mediaFolderFilter]);

  const getMediaUsage = (url: string) => {
    const list: string[] = [];
    products.forEach(p => {
      if (Array.isArray(p.images) && p.images.includes(url)) {
        list.push(`Product: ${p.name}`);
      } else if (typeof p.images === 'string' && p.images.includes(url)) {
        list.push(`Product: ${p.name}`);
      }
    });
    if (cmsSettings?.banners) {
      cmsSettings.banners.forEach((b: any, i: number) => {
        if (b.image === url) {
          list.push(`Hero Slide #${i + 1}`);
        }
      });
    }
    return list;
  };

  // SVG Chart Renders
  const renderLineChart = () => {
    if (!analyticsStats?.dailyVisits || analyticsStats.dailyVisits.length === 0) return null;
    const data = analyticsStats.dailyVisits;
    const maxVal = Math.max(...data.map((d: any) => d.count), 5);
    const w = 500, h = 180, p = 30;

    const points = data.map((d: any, idx: number) => {
      const x = p + (idx * (w - p * 2)) / (data.length - 1);
      const y = h - p - (d.count * (h - p * 2)) / maxVal;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DE2943" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#DE2943" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = p + r * (h - p * 2);
          return <line key={i} x1={p} y1={y} x2={w - p} y2={y} stroke="#F3F4F6" strokeWidth="1" />;
        })}
        {/* Area fill */}
        <polygon points={`${p},${h - p} ${points} ${w - p},${h - p}`} fill="url(#grad)" />
        {/* Trend Polyline */}
        <polyline fill="none" stroke="#DE2943" strokeWidth="2.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d: any, idx: number) => {
          const x = p + (idx * (w - p * 2)) / (data.length - 1);
          const y = h - p - (d.count * (h - p * 2)) / maxVal;
          return (
            <g key={idx} className="group">
              <circle cx={x} cy={y} r="4" fill="#DE2943" stroke="white" strokeWidth="1.5" className="cursor-pointer" />
              <title>{`${d.date}: ${d.count} visits`}</title>
            </g>
          );
        })}
        {/* Dates */}
        {data.map((d: any, idx: number) => {
          const x = p + (idx * (w - p * 2)) / (data.length - 1);
          return (
            <text key={idx} x={x} y={h - 10} textAnchor="middle" className="text-[9px] fill-gray-400 font-mono">
              {d.date.substring(5)}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderFunnelChart = () => {
    const clicks = analyticsStats?.ctaClicks || { call: 0, whatsapp: 0, quote: 0 };
    const maxVal = Math.max(clicks.call, clicks.whatsapp, clicks.quote, 1);
    const data = [
      { label: 'WhatsApp clicks', val: clicks.whatsapp, color: 'bg-emerald-500' },
      { label: 'Call clicks', val: clicks.call, color: 'bg-red-500' },
      { label: 'Quotes requests', val: clicks.quote, color: 'bg-blue-500' }
    ];

    return (
      <div className="space-y-3.5">
        {data.map((d, i) => {
          const w = (d.val / maxVal) * 100;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-[#121110]">
                <span>{d.label}</span>
                <span className="font-mono font-bold">{d.val}</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className={`${d.color} h-full rounded-full transition-all duration-500`} style={{ width: `${w}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // WP-style Alt details helper
  const handleMediaCardSelect = (m: any) => {
    setEditingMedia(m);
    setMediaFormAlt(m.alt || '');
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans flex flex-col">
      {/* CMS Top Header */}
      <header className="h-16 bg-[#121110] border-b border-white/10 px-6 flex justify-between items-center text-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#DE2943]" />
          <h1 className="font-serif font-black tracking-wider text-sm uppercase">TCF Furniture CMS</h1>
          <span className="bg-white/10 text-[9px] px-2 py-0.5 rounded font-mono uppercase">Custom v1.5</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a href="/" target="_blank" className="flex items-center gap-1 hover:text-[#DE2943] text-white/80 transition-colors font-medium">
            <Eye className="w-3.5 h-3.5" /> View Showroom
          </a>
          <button onClick={logout} className="flex items-center gap-1 hover:text-[#DE2943] font-bold text-white/90">
            <LogOut className="w-3.5 h-3.5" /> Exit
          </button>
        </div>
      </header>

      {/* Main CMS Layout */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#121110] text-white/70 border-r border-white/10 p-4 space-y-4 hidden md:block">
          <div className="space-y-1">
            <button 
              onClick={() => { setActiveTab('dashboard'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-left transition-all ${activeTab === 'dashboard' ? 'bg-[#DE2943] text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
          </div>

          {/* Section: WEBSITE */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('website')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/40 hover:text-white"
            >
              <span>Website</span>
              {expandedMenus.website ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedMenus.website && (
              <div className="pl-3 space-y-0.5 text-xs font-semibold">
                <button 
                  onClick={() => { setActiveTab('website'); setActiveSubTab('web-homepage'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'website' && activeSubTab === 'web-homepage' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Homepage Builder
                </button>
                <button 
                  onClick={() => { setActiveTab('website'); setActiveSubTab('web-pages'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'website' && activeSubTab === 'web-pages' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Showroom Pages
                </button>
              </div>
            )}
          </div>

          {/* Section: PRODUCTS */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('products')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/40 hover:text-white"
            >
              <span>Products</span>
              {expandedMenus.products ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedMenus.products && (
              <div className="pl-3 space-y-0.5 text-xs font-semibold">
                <button 
                  onClick={() => { setActiveTab('products'); setActiveSubTab('prod-catalog'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'products' && activeSubTab === 'prod-catalog' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Products Catalog
                </button>
                <button 
                  onClick={() => { setActiveTab('products'); setActiveSubTab('prod-categories'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'products' && activeSubTab === 'prod-categories' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Categories
                </button>
              </div>
            )}
          </div>

          {/* Section: CONTENT */}
          <div className="space-y-1">
            <button 
              onClick={() => { setActiveTab('content'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-left transition-all ${activeTab === 'content' ? 'bg-[#DE2943] text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> Blogs Content
            </button>
          </div>

          {/* Section: MEDIA */}
          <div className="space-y-1">
            <button 
              onClick={() => { setActiveTab('media'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-left transition-all ${activeTab === 'media' ? 'bg-[#DE2943] text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <ImageIcon className="w-4 h-4" /> Media Library
            </button>
          </div>

          {/* Section: LEADS */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('leads')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/40 hover:text-white"
            >
              <span>Leads</span>
              {expandedMenus.leads ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedMenus.leads && (
              <div className="pl-3 space-y-0.5 text-xs font-semibold">
                <button 
                  onClick={() => { setActiveTab('leads'); setActiveSubTab('leads-contacts'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'leads' && activeSubTab === 'leads-contacts' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Contact Forms
                </button>
                <button 
                  onClick={() => { setActiveTab('leads'); setActiveSubTab('leads-quotes'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'leads' && activeSubTab === 'leads-quotes' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Quote Requests
                </button>
              </div>
            )}
          </div>

          {/* Section: MARKETING */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('marketing')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/40 hover:text-white"
            >
              <span>Marketing</span>
              {expandedMenus.marketing ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedMenus.marketing && (
              <div className="pl-3 space-y-0.5 text-xs font-semibold">
                <button 
                  onClick={() => { setActiveTab('marketing'); setActiveSubTab('mkt-seo'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'marketing' && activeSubTab === 'mkt-seo' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Showroom SEO
                </button>
              </div>
            )}
          </div>

          {/* Section: ANALYTICS */}
          <div className="space-y-1">
            <button 
              onClick={() => { setActiveTab('analytics'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-left transition-all ${activeTab === 'analytics' ? 'bg-[#DE2943] text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <BarChart3 className="w-4 h-4" /> Deep Analytics
            </button>
          </div>

          {/* Section: SETTINGS */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('settings')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/40 hover:text-white"
            >
              <span>Settings</span>
              {expandedMenus.settings ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedMenus.settings && (
              <div className="pl-3 space-y-0.5 text-xs font-semibold">
                <button 
                  onClick={() => { setActiveTab('settings'); setActiveSubTab('set-business'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'settings' && activeSubTab === 'set-business' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Business Profile
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setActiveSubTab('set-integrations'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'settings' && activeSubTab === 'set-integrations' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Integrations
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setActiveSubTab('set-backups'); }}
                  className={`w-full text-left py-1.5 px-3 rounded-md transition-colors ${activeTab === 'settings' && activeSubTab === 'set-backups' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                >
                  Backups
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto space-y-6">

          {/* TAB: Actionable Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-black text-[#121110]">Good Morning, TCF Furniture</h2>
                <p className="text-xs text-gray-500">Here is what needs your attention today in the Tenali showroom.</p>
              </div>

              {/* Today's Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Today's Leads</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-[#DE2943]">{leads.filter(l => l.status === 'New').length}</span>
                    <span className="text-xs text-gray-500 font-medium">pending callback</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Showroom Call Clicks</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-[#121110]">{analyticsStats?.ctaClicks?.call || 0}</span>
                    <span className="text-xs text-gray-500 font-medium">phone call triggers</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">WhatsApp Enquiries</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-emerald-600">{analyticsStats?.ctaClicks?.whatsapp || 0}</span>
                    <span className="text-xs text-gray-500 font-medium">chats initiated</span>
                  </div>
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Quick Actions & Activities */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#121110]">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleOpenProductModal()}
                        className="p-3 bg-gray-50 hover:bg-[#DE2943]/10 hover:text-[#DE2943] border border-gray-200 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Product</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('website'); setActiveHomeSection('hero'); }}
                        className="p-3 bg-gray-50 hover:bg-[#DE2943]/10 hover:text-[#DE2943] border border-gray-200 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Change Hero Banner</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('media'); }}
                        className="p-3 bg-gray-50 hover:bg-[#DE2943]/10 hover:text-[#DE2943] border border-gray-200 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload Media</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('website'); setActiveHomeSection('bestsellers'); }}
                        className="p-3 bg-gray-50 hover:bg-[#DE2943]/10 hover:text-[#DE2943] border border-gray-200 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <Star className="w-5 h-5" />
                        <span>Update Bestsellers</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('website'); setActiveHomeSection('testimonials'); }}
                        className="p-3 bg-gray-50 hover:bg-[#DE2943]/10 hover:text-[#DE2943] border border-gray-200 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <Users className="w-5 h-5" />
                        <span>Edit Reviews</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('settings'); setActiveSubTab('set-backups'); }}
                        className="p-3 bg-gray-50 hover:bg-[#DE2943]/10 hover:text-[#DE2943] border border-gray-200 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <Download className="w-5 h-5" />
                        <span>Backup JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Leads */}
                  <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#121110]">Recent Enquiries</h3>
                      <button 
                        onClick={() => { setActiveTab('leads'); setActiveSubTab('leads-contacts'); }}
                        className="text-xs font-bold text-[#DE2943] hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {leads.slice(0, 4).map((l, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                          <div>
                            <span className="font-bold text-[#121110] block">{l.name}</span>
                            <span className="text-gray-500 font-mono text-[10px]">{l.phone}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              l.status === 'New' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>{l.status}</span>
                            <span className="block text-[8px] text-gray-400 mt-1">{new Date(l.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Storage & Traffic KPI Panel */}
                <div className="space-y-6">
                  {/* Traffic Quick Card */}
                  <div className="bg-[#121110] text-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Live Traffic</span>
                      <h3 className="text-3xl font-bold font-mono text-[#DE2943]">{analyticsStats?.totalVisits || 0}</h3>
                      <p className="text-[11px] text-white/60">Unique visitor sessions tracked globally.</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      {renderLineChart()}
                    </div>
                  </div>

                  {/* System Storage stats */}
                  <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#121110]">System Resource Status</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Local JSON DBs</span>
                        <span className="font-bold text-[#121110]">7 Tables (Ok)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Showroom Images</span>
                        <span className="font-bold text-[#121110]">{mediaItems.length} Uploads</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Google Sheets Sync</span>
                        <span className="font-bold text-gray-400 italic">Local Fallback</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: Website (Homepage visual editors & pages content) */}
          {activeTab === 'website' && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubTab === 'web-homepage' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif font-black text-[#121110]">Homepage Builder</h2>
                    <p className="text-xs text-gray-500">Visual manager. Toggle, edit, and re-order homepage sections.</p>
                  </div>

                  {/* Section Selector Subbar */}
                  <div className="flex gap-1.5 flex-wrap border-b border-gray-200 pb-2">
                    {(['hero', 'categories', 'why-us', 'bestsellers', 'featured', 'gallery', 'testimonials', 'faq', 'footer'] as HomepageSection[]).map(sect => (
                      <button
                        key={sect}
                        type="button"
                        onClick={() => setActiveHomeSection(sect)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                          activeHomeSection === sect ? 'bg-[#DE2943] text-white' : 'bg-white hover:bg-gray-100 text-[#121110] border border-gray-200'
                        }`}
                      >
                        {sect.replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Section View: Hero Slider */}
                  {activeHomeSection === 'hero' && cmsSettings && (
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-serif font-bold text-[#121110]">Hero Slider Config</h3>
                        <button 
                          type="button" 
                          onClick={addHeroBanner}
                          className="px-3 py-1.5 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                        >
                          + Add Slide
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cmsSettings.banners?.map((slide: any, idx: number) => (
                          <div key={slide.id || idx} className="border border-gray-200 p-4 rounded-xl bg-gray-50 relative space-y-4">
                            <button
                              type="button"
                              onClick={() => removeHeroBanner(idx)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-[#DE2943] uppercase tracking-wider">Slide #{idx + 1}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Headline</label>
                                <input 
                                  type="text" 
                                  value={slide.title || ''} 
                                  onChange={(e) => {
                                    const list = [...cmsSettings.banners];
                                    list[idx].title = e.target.value;
                                    setCmsSettings({ ...cmsSettings, banners: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Sub Heading</label>
                                <input 
                                  type="text" 
                                  value={slide.subtitle || ''} 
                                  onChange={(e) => {
                                    const list = [...cmsSettings.banners];
                                    list[idx].subtitle = e.target.value;
                                    setCmsSettings({ ...cmsSettings, banners: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Button Text</label>
                                <input 
                                  type="text" 
                                  value={slide.ctaText || ''} 
                                  onChange={(e) => {
                                    const list = [...cmsSettings.banners];
                                    list[idx].ctaText = e.target.value;
                                    setCmsSettings({ ...cmsSettings, banners: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Button URL</label>
                                <input 
                                  type="text" 
                                  value={slide.ctaLink || ''} 
                                  onChange={(e) => {
                                    const list = [...cmsSettings.banners];
                                    list[idx].ctaLink = e.target.value;
                                    setCmsSettings({ ...cmsSettings, banners: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110] font-mono"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Slide Image URL</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={slide.image || ''} 
                                    onChange={(e) => {
                                      const list = [...cmsSettings.banners];
                                      list[idx].image = e.target.value;
                                      setCmsSettings({ ...cmsSettings, banners: list });
                                    }}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110] font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMediaPickerTarget('cms-banner');
                                      setBannerPickerIndex(idx);
                                      setIsMediaPickerOpen(true);
                                    }}
                                    className="px-3 py-1.5 bg-gray-800 text-white font-bold text-[10px] uppercase rounded-lg"
                                  >
                                    Select Image
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="button" onClick={handleSaveCmsSettings} className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                          <Save className="w-4 h-4" /> Save Hero Slider
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section View: Signature Bestsellers */}
                  {activeHomeSection === 'bestsellers' && cmsSettings && (
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#121110]">Signature Bestsellers Manager</h3>
                        <p className="text-xs text-gray-500">Select which products appear on the homepage as Bestsellers.</p>
                      </div>

                      <div className="space-y-4">
                        {/* Selector grid */}
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Add Product to Bestsellers</span>
                          <div className="flex gap-2">
                            <select
                              id="add-bestseller-select"
                              className="flex-1 px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                            >
                              {products.filter(p => !p.archived).map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const sel = document.getElementById('add-bestseller-select') as HTMLSelectElement;
                                if (!sel || !sel.value) return;
                                const pId = sel.value;
                                if (cmsSettings.bestsellerIds?.includes(pId)) return alert('Product already in bestsellers.');
                                const list = [...(cmsSettings.bestsellerIds || []), pId];
                                setCmsSettings({ ...cmsSettings, bestsellerIds: list });
                              }}
                              className="px-4 py-2 bg-gray-800 text-white font-bold text-xs uppercase rounded-lg"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2.5">
                          {cmsSettings.bestsellerIds?.map((id: string, idx: number) => {
                            const prod = products.find(p => p.id === id);
                            if (!prod) return null;
                            return (
                              <div key={id} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl text-xs">
                                <div className="flex items-center gap-3">
                                  {prod.images?.[0] && <img src={prod.images[0]} className="w-10 h-10 object-cover rounded border" />}
                                  <div>
                                    <span className="font-bold text-[#121110] block">{prod.name}</span>
                                    <span className="text-gray-400 font-mono text-[9px]">{prod.sku}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const list = [...cmsSettings.bestsellerIds];
                                      const temp = list[idx];
                                      list[idx] = list[idx - 1];
                                      list[idx - 1] = temp;
                                      setCmsSettings({ ...cmsSettings, bestsellerIds: list });
                                    }}
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-40"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === cmsSettings.bestsellerIds.length - 1}
                                    onClick={() => {
                                      const list = [...cmsSettings.bestsellerIds];
                                      const temp = list[idx];
                                      list[idx] = list[idx + 1];
                                      list[idx + 1] = temp;
                                      setCmsSettings({ ...cmsSettings, bestsellerIds: list });
                                    }}
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-40"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = cmsSettings.bestsellerIds.filter((bid: string) => bid !== id);
                                      setCmsSettings({ ...cmsSettings, bestsellerIds: list });
                                    }}
                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="button" onClick={handleSaveCmsSettings} className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                          <Save className="w-4 h-4" /> Save Bestsellers
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section View: Testimonials */}
                  {activeHomeSection === 'testimonials' && cmsSettings && (
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-serif font-bold text-[#121110]">Showroom Testimonials</h3>
                        <button 
                          type="button" 
                          onClick={addTestimonial}
                          className="px-3 py-1.5 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                        >
                          + Add Testimonial
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cmsSettings.testimonials?.map((t: any, idx: number) => (
                          <div key={t.id || idx} className="border border-gray-200 p-4 rounded-xl bg-gray-50/50 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => removeTestimonial(t.id)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-[#DE2943] uppercase tracking-wider block">Testimonial #{idx + 1}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Client Name</label>
                                <input 
                                  type="text" 
                                  value={t.name || ''} 
                                  required
                                  onChange={(e) => {
                                    const list = [...cmsSettings.testimonials];
                                    list[idx].name = e.target.value;
                                    setCmsSettings({ ...cmsSettings, testimonials: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Rating (1-5)</label>
                                <input 
                                  type="number" 
                                  min="1" max="5"
                                  value={t.rating || 5} 
                                  required
                                  onChange={(e) => {
                                    const list = [...cmsSettings.testimonials];
                                    list[idx].rating = Number(e.target.value);
                                    setCmsSettings({ ...cmsSettings, testimonials: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Quote Review</label>
                                <textarea 
                                  rows={3}
                                  value={t.quote || ''} 
                                  required
                                  onChange={(e) => {
                                    const list = [...cmsSettings.testimonials];
                                    list[idx].quote = e.target.value;
                                    setCmsSettings({ ...cmsSettings, testimonials: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="button" onClick={handleSaveCmsSettings} className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                          <Save className="w-4 h-4" /> Save Testimonials
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section View: FAQs */}
                  {activeHomeSection === 'faq' && cmsSettings && (
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-serif font-bold text-[#121110]">Interactive FAQs</h3>
                        <button 
                          type="button" 
                          onClick={addFAQ}
                          className="px-3 py-1.5 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                        >
                          + Add FAQ
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cmsSettings.faqs?.map((faq: any, idx: number) => (
                          <div key={faq.id || idx} className="border border-gray-200 p-4 rounded-xl bg-gray-50/50 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => removeFAQ(faq.id)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-[#DE2943] uppercase tracking-wider block">FAQ #{idx + 1}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Question</label>
                                <input 
                                  type="text" 
                                  value={faq.question || ''} 
                                  required
                                  onChange={(e) => {
                                    const list = [...cmsSettings.faqs];
                                    list[idx].question = e.target.value;
                                    setCmsSettings({ ...cmsSettings, faqs: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Category Tag</label>
                                <input 
                                  type="text" 
                                  value={faq.category || ''} 
                                  required
                                  onChange={(e) => {
                                    const list = [...cmsSettings.faqs];
                                    list[idx].category = e.target.value;
                                    setCmsSettings({ ...cmsSettings, faqs: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[9px] font-bold uppercase text-gray-500">Answer Text</label>
                                <textarea 
                                  rows={2}
                                  value={faq.answer || ''} 
                                  required
                                  onChange={(e) => {
                                    const list = [...cmsSettings.faqs];
                                    list[idx].answer = e.target.value;
                                    setCmsSettings({ ...cmsSettings, faqs: list });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="button" onClick={handleSaveCmsSettings} className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                          <Save className="w-4 h-4" /> Save FAQs
                        </button>
                      </div>
                    </div>
                  )}

                  {activeHomeSection === 'categories' && (
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-serif font-bold text-[#121110]">Showroom Categories</h2>
                          <p className="text-xs text-gray-500 font-mono">Add, edit details, upload banners, or delete categories used in the showroom catalogue.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryModal()}
                          className="px-3.5 py-2 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Add Category
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map((c) => (
                          <div key={c.id} className="border border-gray-200 p-4 bg-gray-50 rounded-xl space-y-2 relative group">
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpenCategoryModal(c)}
                                className="text-blue-500 hover:text-blue-700 bg-white p-1 rounded border border-gray-200"
                                title="Edit Category"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(c.id)}
                                className="text-red-500 hover:text-red-700 bg-white p-1 rounded border border-gray-200"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Slug: {c.slug}</span>
                            <h4 className="font-serif font-bold text-sm text-[#121110]">{c.name}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed truncate">{c.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback Section editors (Other homepage sections like Why choose us/Footer/Gallery etc.) */}
                  {['why-us', 'featured', 'gallery', 'footer'].includes(activeHomeSection) && cmsSettings && (
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 text-center py-12">
                      <HelpCircle className="w-12 h-12 text-gray-350 mx-auto" />
                      <h4 className="text-sm font-bold text-[#121110] capitalize">{activeHomeSection.replace('-', ' ')} Settings</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">This section uses the global settings content configured in SEO and Business settings tabs.</p>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'web-pages' && cmsSettings && (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif font-black text-[#121110]">Showroom Pages content</h2>
                    <p className="text-xs text-gray-500">Edit content for static pages like About Us page.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Our Story</label>
                      <textarea 
                        rows={3}
                        value={cmsSettings.about?.story || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          about: { ...cmsSettings.about, story: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mission Statement</label>
                      <textarea 
                        rows={2}
                        value={cmsSettings.about?.mission || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          about: { ...cmsSettings.about, mission: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button type="button" onClick={handleSaveCmsSettings} className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> Save Page Content
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Products (Shopify-style advanced listing & categories) */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubTab === 'prod-catalog' && (
                <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-2xl w-full space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#121110]">Products Catalog</h2>
                      <p className="text-xs text-gray-500">Shopify-style management dashboard for all products.</p>
                    </div>
                    <button
                      onClick={() => handleOpenProductModal()}
                      className="px-4 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm rounded-lg cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>

                  {/* Filters bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F5F2EB]/50 p-4 rounded-xl border border-gray-150">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search name, SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none focus:border-[#DE2943] text-[#121110]"
                      />
                    </div>
                    <div>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none focus:border-[#DE2943] text-[#121110]"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={productArchiveFilter}
                        onChange={(e) => setProductArchiveFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none focus:border-[#DE2943] text-[#121110]"
                      >
                        <option value="active">Active Only</option>
                        <option value="archived">Archived Only</option>
                        <option value="all">All Products</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F5F2EB] text-[#121110] border-b border-gray-200 font-bold">
                          <th className="p-3">SKU</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Material</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProductsList.length > 0 ? (
                          filteredProductsList.map((p, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                              <td className="p-3 font-mono font-semibold">{p.sku}</td>
                              <td className="p-3">
                                <span className="font-bold text-[#121110] block">{p.name}</span>
                                {p.featured && (
                                  <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5">Featured</span>
                                )}
                              </td>
                              <td className="p-3 uppercase text-[9px] font-bold text-gray-500">{p.category}</td>
                              <td className="p-3">{p.material}</td>
                              <td className="p-3 font-mono font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                              <td className="p-3">
                                {p.archived ? (
                                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold text-[9px] border border-red-100">Archived</span>
                                ) : (
                                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold text-[9px] border border-green-100">Active</span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => handleOpenProductModal(p)}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDuplicateProduct(p)}
                                    className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {p.archived ? (
                                    <button 
                                      onClick={() => handleArchiveProduct(p.id, false)}
                                      className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded"
                                      title="Restore"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleArchiveProduct(p.id, true)}
                                      className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded"
                                      title="Archive"
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-[#DE2943] rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-gray-500 italic">No products matched current filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSubTab === 'prod-categories' && (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-[#121110]">Showroom Categories</h2>
                      <p className="text-xs text-gray-500">List of furniture categories used on public catalog filter pages.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCategoryModal}
                      className="px-3.5 py-2 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((c) => (
                      <div key={c.id} className="border border-gray-200 p-4 bg-gray-50 rounded-xl space-y-2 relative group">
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryModal(c)}
                            className="text-blue-500 hover:text-blue-700 bg-white p-1 rounded border border-gray-200"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id)}
                            className="text-red-500 hover:text-red-700 bg-white p-1 rounded border border-gray-200"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Slug: {c.slug}</span>
                        <h4 className="font-serif font-bold text-sm text-[#121110]">{c.name}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed truncate">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Content (Blogs CRUD & static page copy) */}
          {activeTab === 'content' && (
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 text-center py-12 animate-fadeIn">
              <FileText className="w-12 h-12 text-gray-350 mx-auto" />
              <h3 className="text-base font-serif font-bold text-[#121110]">Blogs CMS & Editorial Manager</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Configure and publish informational blog posts. For custom layouts, you can edit posts inside the dynamic pages route logs.</p>
            </div>
          )}

          {/* TAB: Media (Advanced WP-style media library) */}
          {activeTab === 'media' && (
            <div className="space-y-6 bg-white border border-gray-200 p-6 shadow-sm rounded-2xl w-full animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#121110]">Media Asset Library</h2>
                  <p className="text-xs text-gray-500">WordPress-style manager. Upload, replace, check image usages, or alt text.</p>
                </div>
                
                {/* Upload bar */}
                <div className="flex items-center gap-2">
                  {bulkSelectMedia.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteMedia}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-[#DE2943] text-xs font-bold uppercase rounded-lg"
                    >
                      Delete Selected ({bulkSelectMedia.length})
                    </button>
                  )}
                  <label className="px-4 py-2.5 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 rounded-lg cursor-pointer shadow-sm">
                    {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Assets
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      disabled={uploadingMedia}
                      onChange={handleMediaUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Advanced Search & Directory filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F5F2EB]/50 p-4 rounded-xl border border-gray-150">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by file name or SEO alt tag..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={mediaFolderFilter}
                    onChange={(e) => setMediaFolderFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none"
                  >
                    <option value="all">All Directories</option>
                    <option value="/general">/general</option>
                    <option value="/products">/products</option>
                    <option value="/banners">/banners</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredMediaList.length > 0 ? (
                  filteredMediaList.map((m) => {
                    const isSelected = bulkSelectMedia.includes(m.id);
                    return (
                      <div 
                        key={m.id}
                        className={`group border rounded-xl overflow-hidden cursor-pointer relative hover:border-[#DE2943] transition-all bg-gray-50 ${
                          editingMedia?.id === m.id ? 'ring-2 ring-[#DE2943] border-transparent' : 'border-gray-200'
                        }`}
                        onClick={() => handleMediaCardSelect(m)}
                      >
                        <div 
                          className="absolute top-2 left-2 z-10 p-0.5 bg-white/80 rounded border"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              setBulkSelectMedia(bulkSelectMedia.filter(id => id !== m.id));
                            } else {
                              setBulkSelectMedia([...bulkSelectMedia, m.id]);
                            }
                          }}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-[#DE2943] border-[#DE2943] text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>

                        <div className="aspect-square relative flex items-center justify-center p-2 bg-white">
                          <img src={m.url} alt={m.alt} className="object-contain max-h-full max-w-full" />
                        </div>
                        <div className="p-2 bg-white text-[10px] truncate border-t border-gray-100">
                          <span className="font-semibold text-[#121110] block truncate">{m.filename}</span>
                          <span className="text-gray-400">{m.size}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 italic">No media items match query.</div>
                )}
              </div>

              {/* WP-style Side panel details drawer */}
              {editingMedia && (
                <div className="bg-[#F5F2EB]/50 border border-[#DE2943]/20 p-5 rounded-2xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start relative animate-fadeIn">
                  <button 
                    onClick={() => setEditingMedia(null)}
                    className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-200 text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="aspect-square border border-gray-200 bg-white rounded-lg flex items-center justify-center p-2 max-h-48">
                    <img src={editingMedia.url} alt={editingMedia.alt} className="object-contain max-h-full max-w-full" />
                  </div>

                  <div className="sm:col-span-2 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#121110] truncate">{editingMedia.filename}</h4>
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Asset Link: {editingMedia.url}</span>
                      <span className="text-[10px] text-gray-500 block">Uploaded: {new Date(editingMedia.createdAt).toLocaleString()}</span>
                      
                      {/* Traced Usage */}
                      <div className="mt-2 space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Global Usage Traces</span>
                        {getMediaUsage(editingMedia.url).length > 0 ? (
                          <div className="flex gap-1.5 flex-wrap">
                            {getMediaUsage(editingMedia.url).map((u, i) => (
                              <span key={i} className="inline-block bg-[#121110] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{u}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-orange-600 font-semibold italic">Unused asset (Safe to delete)</span>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleUpdateMediaAlt} className="space-y-3 max-w-md">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">SEO Alt Text Attribute</label>
                        <input 
                          type="text" 
                          value={mediaFormAlt}
                          onChange={(e) => setMediaFormAlt(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-1.5 bg-[#121110] hover:bg-[#DE2943] text-white font-bold text-xs uppercase rounded-lg">
                          Save Alt Text
                        </button>
                        
                        {/* Replace asset trigger */}
                        <label className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs uppercase rounded-lg cursor-pointer flex items-center justify-center">
                          Replace Asset
                          <input type="file" accept="image/*" onChange={handleReplaceMediaAsset} className="hidden" />
                        </label>

                        <button 
                          type="button"
                          onClick={() => handleDeleteMedia(editingMedia.id)}
                          className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-[#DE2943] font-bold text-xs uppercase rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Leads Forms (Contacts, Quotes, Callbacks) */}
          {activeTab === 'leads' && (
            <div className="space-y-6 bg-white border border-gray-200 p-6 shadow-sm rounded-2xl w-full animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#121110]">
                    {activeSubTab === 'leads-contacts' ? 'General Contact forms' : 'Bespoke Quote requests'}
                  </h2>
                  <p className="text-xs text-gray-500">Manage statuses, coordinator logs, and download file attachments.</p>
                </div>
                <button 
                  onClick={exportLeadsCSV}
                  className="px-4 py-2.5 bg-[#121110] hover:bg-[#DE2943] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm rounded-lg"
                >
                  <Download className="w-4 h-4" /> Export CSV Leads
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5F2EB]/50 p-4 rounded-xl border border-gray-150">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search name, phone, lead ID..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2EB] text-[#121110] border-b border-gray-200 font-bold">
                      <th className="p-3">ID</th>
                      <th className="p-3">Customer Details</th>
                      <th className="p-3">Type & Details</th>
                      <th className="p-3">Attachments</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Notes Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeadsList.length > 0 ? (
                      filteredLeadsList.map((l, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                          <td className="p-3 font-mono font-semibold">{l.leadId}</td>
                          <td className="p-3">
                            <span className="font-bold text-[#121110] block text-sm">{l.name}</span>
                            <span className="text-[10px] text-gray-500 block font-mono mt-0.5">{l.phone}</span>
                            {l.email && <span className="text-[10px] text-gray-500 block">{l.email}</span>}
                          </td>
                          <td className="p-3">
                            <span className="font-bold uppercase text-[9px] bg-red-50 text-[#DE2943] px-2 py-0.5 rounded tracking-wider border border-red-100 inline-block mb-1">{l.type}</span>
                            {l.material && (
                              <div className="text-[10px] text-gray-600 font-medium">
                                {l.material} {l.finish ? `(${l.finish})` : ''} - {l.dimensions || 'No size'}
                              </div>
                            )}
                            <p className="text-[10px] text-gray-500 italic truncate max-w-[200px]" title={l.message}>{l.message}</p>
                          </td>
                          <td className="p-3 space-y-1">
                            {l.referenceImages && l.referenceImages.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {l.referenceImages.map((img: string, idx: number) => (
                                  <a key={idx} href={img} target="_blank" rel="noreferrer" className="inline-block px-1.5 py-0.5 bg-white border border-gray-200 text-[9px] font-bold text-[#DE2943] hover:bg-gray-50 rounded">
                                    IMG {idx + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                            {l.floorPlan && (
                              <a href={l.floorPlan} target="_blank" rel="noreferrer" className="block text-[9px] font-bold text-blue-600 hover:underline">📂 Floor Plan</a>
                            )}
                            {l.roomPhoto && (
                              <a href={l.roomPhoto} target="_blank" rel="noreferrer" className="block text-[9px] font-bold text-green-600 hover:underline">🖼️ Room Photo</a>
                            )}
                            {(!l.referenceImages || l.referenceImages.length === 0) && !l.floorPlan && !l.roomPhoto && (
                              <span className="text-[9px] text-gray-400 italic">No Uploads</span>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={l.status}
                              onChange={(e) => handleUpdateLeadStatus(l.leadId, e.target.value)}
                              className={`font-semibold text-[10px] border p-1 rounded-lg bg-white cursor-pointer ${
                                l.status === 'New' ? 'text-red-700 border-red-200 bg-red-50' :
                                l.status === 'Contacted' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                                l.status === 'Qualified' ? 'text-amber-700 border-amber-200 bg-amber-50' :
                                l.status === 'Closed' ? 'text-green-700 border-green-200 bg-green-50' :
                                'text-gray-600 border-gray-200 bg-gray-50'
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Closed">Closed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-600 max-w-[120px] truncate block" title={l.staffNotes || ''}>
                                {l.staffNotes || <span className="text-gray-350 italic">No logs</span>}
                              </span>
                              <button 
                                onClick={() => openLeadNotesModal(l)}
                                className="p-1 hover:bg-gray-100 rounded text-[#121110]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500 italic">No leads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Marketing (SEO & Sitemap) */}
          {activeTab === 'marketing' && cmsSettings && (
            <div className="space-y-6 bg-white border border-gray-200 p-6 shadow-sm rounded-2xl w-full animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#121110]">Marketing & SEO Config</h2>
                <p className="text-xs text-gray-500">Configure global metadata tags and search crawlers rules.</p>
              </div>

              <form onSubmit={handleSaveCmsSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Global Website Title</label>
                    <input 
                      type="text" 
                      required
                      value={cmsSettings.seo?.siteTitle || ''}
                      onChange={(e) => setCmsSettings({
                        ...cmsSettings,
                        seo: { ...cmsSettings.seo, siteTitle: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Global OG Image Link</label>
                    <input 
                      type="text" 
                      required
                      value={cmsSettings.seo?.ogImage || ''}
                      onChange={(e) => setCmsSettings({
                        ...cmsSettings,
                        seo: { ...cmsSettings.seo, ogImage: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110] font-mono"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Global Website Meta Description</label>
                    <textarea 
                      rows={3}
                      required
                      value={cmsSettings.seo?.siteDescription || ''}
                      onChange={(e) => setCmsSettings({
                        ...cmsSettings,
                        seo: { ...cmsSettings.seo, siteDescription: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="submit" className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Save SEO Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: Deep Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 bg-white border border-gray-200 p-6 shadow-sm rounded-2xl w-full animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#121110]">Analytics Insights</h2>
                <p className="text-xs text-gray-500">Deep performance metrics of TCF showroom leads and visits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-150 p-4 rounded-xl bg-gray-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Unique Visits Trend</h4>
                  {renderLineChart()}
                </div>
                <div className="border border-gray-150 p-4 rounded-xl bg-gray-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">CTA Conversion Funnel</h4>
                  {renderFunnelChart()}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Settings (Business profile & Backups) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubTab === 'set-business' && cmsSettings && (
                <form onSubmit={handleSaveCmsSettings} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#121110]">Store Business Profile</h2>
                    <p className="text-xs text-gray-500">Edit address coordinates, maps details, phone call numbers, and WhatsApp links.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Phone Calls Number</label>
                      <input 
                        type="text" 
                        required
                        value={cmsSettings.contact?.phone || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contact: { ...cmsSettings.contact, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">WhatsApp URL Link</label>
                      <input 
                        type="text" 
                        required
                        value={cmsSettings.contact?.whatsapp || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contact: { ...cmsSettings.contact, whatsapp: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={cmsSettings.contact?.email || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contact: { ...cmsSettings.contact, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Working Hours Details</label>
                      <input 
                        type="text" 
                        required
                        value={cmsSettings.contact?.hours || '09:00 AM - 09:00 PM Daily'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contact: { ...cmsSettings.contact, hours: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Showroom Address</label>
                      <textarea 
                        rows={2}
                        required
                        value={cmsSettings.contact?.address || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contact: { ...cmsSettings.contact, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button type="submit" className="px-6 py-2.5 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> Save Contact Details
                    </button>
                  </div>
                </form>
              )}

              {activeSubTab === 'set-integrations' && (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 text-center py-12">
                  <Globe className="w-12 h-12 text-gray-350 mx-auto" />
                  <h3 className="text-base font-serif font-bold text-[#121110]">Google GA4 & GSC integrations</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Input code integration IDs to track public search engine conversions directly in settings drawers.</p>
                </div>
              )}

              {activeSubTab === 'set-backups' && (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#121110]">Database Backup & Restore</h2>
                    <p className="text-xs text-gray-500">Export or restore the entire TCF Local database as a single file.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Export Card */}
                    <div className="border border-gray-200 p-5 rounded-xl bg-gray-50/50 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#121110]">Export Database Tables</h4>
                      <p className="text-[11px] text-gray-500">Download all products, categories, settings, blogs, and leads as a JSON file.</p>
                      <button 
                        type="button" 
                        onClick={handleBackupExport}
                        className="px-4 py-2 bg-[#121110] hover:bg-[#DE2943] text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download Backup
                      </button>
                    </div>

                    {/* Import Card */}
                    <form onSubmit={handleBackupImport} className="border border-gray-200 p-5 rounded-xl bg-gray-50/50 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#121110]">Restore Database Tables</h4>
                      <p className="text-[11px] text-gray-500">Upload a previously exported JSON backup file to overwrite current data.</p>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          accept=".json"
                          required
                          onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                          className="text-xs"
                        />
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-gray-800 text-white font-bold text-xs uppercase rounded-lg flex items-center gap-1.5 self-start"
                        >
                          <Upload className="w-4 h-4" /> Restore Backup
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* --- advanced SELECT MEDIA LIBRARY DIALOG MODAL (WordPress style) --- */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-white border border-[#DE2943]/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#F5F2EB]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#121110]">Media Asset Selector</h3>
                <p className="text-xs text-gray-500">Double click or click select on an image to insert it.</p>
              </div>
              <button 
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-[#121110]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-gray-100 pb-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search images..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-white text-xs rounded-lg focus:outline-none"
                  />
                </div>
                <label className="px-4 py-2 bg-[#DE2943] text-white hover:bg-red-750 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 rounded-lg cursor-pointer">
                  {uploadingMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload Image
                  <input type="file" accept="image/*" disabled={uploadingMedia} onChange={handleMediaUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {filteredMediaList.length > 0 ? (
                  filteredMediaList.map((m) => (
                    <div 
                      key={m.id} 
                      onClick={() => selectMediaItem(m.url)}
                      className="border border-gray-200 hover:border-[#DE2943] rounded-xl overflow-hidden cursor-pointer bg-gray-50 hover:shadow-md transition-all group"
                    >
                      <div className="aspect-square relative flex items-center justify-center p-2 bg-white">
                        <img src={m.url} alt={m.alt} className="object-contain max-h-full max-w-full" />
                      </div>
                      <div className="p-2 bg-white text-[9px] truncate border-t border-gray-100 text-center font-bold">
                        {m.filename}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 italic">No media found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STAFF NOTES DIALOG MODAL --- */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#DE2943]/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-[#F5F2EB] flex justify-between items-center">
              <h3 className="text-base font-serif font-bold text-[#121110]">Coordinator log</h3>
              <button onClick={() => setViewingLead(null)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Customer</span>
                <h4 className="text-sm font-bold text-[#121110]">{viewingLead.name} ({viewingLead.phone})</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Add Coordinator Notes</label>
                <textarea 
                  rows={4}
                  value={leadNotesText}
                  onChange={(e) => setLeadNotesText(e.target.value)}
                  placeholder="Enter callbacks, quote amount logs..."
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setViewingLead(null)}
                  className="px-4 py-2 border border-gray-205 text-[#121110] font-bold text-xs uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleUpdateLeadNotes}
                  className="px-4 py-2 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase rounded-lg"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- advanced SHOPIFY-STYLE PRODUCT ADD/EDIT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-white border border-[#DE2943]/20 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 flex items-center justify-between bg-[#F5F2EB]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#121110]">
                  {editingProduct ? 'Edit Catalog Masterpiece' : 'Add New Masterpiece'}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">Product ID: {productForm.id}</span>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shopify-style Sub-navigation Tabs */}
            <div className="flex gap-1 border-b border-gray-200 px-6 bg-gray-50/50">
              {(['general', 'seo', 'gallery', 'specifications', 'related', 'visibility', 'preview'] as ProductTab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveProductTab(tab)}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeProductTab === tab ? 'border-[#DE2943] text-[#DE2943]' : 'border-transparent text-gray-500 hover:text-[#DE2943]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form & Tab Contents */}
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Tab: General */}
              {activeProductTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Product Name</label>
                      <input 
                        type="text" 
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">SKU Code</label>
                      <input 
                        type="text" 
                        required
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Category Slug</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Wood Material</label>
                      <select
                        value={productForm.material}
                        onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      >
                        {woodMaterials.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Regular Price (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={productForm.price || ''}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Sale Price (₹) <span className="text-[8px] text-gray-400">(Optional)</span></label>
                      <input 
                        type="number" 
                        value={productForm.salePrice}
                        onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Dimensions</label>
                      <input 
                        type="text" 
                        value={productForm.dimensions}
                        onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={productForm.weight || ''}
                        onChange={(e) => setProductForm({ ...productForm, weight: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Product Description</label>
                    <textarea 
                      rows={4}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                    />
                  </div>
                </div>
              )}

              {/* Tab: SEO */}
              {activeProductTab === 'seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">SEO Meta Title</label>
                      <input 
                        type="text" 
                        value={productForm.seoTitle}
                        onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Custom URL Slug</label>
                      <input 
                        type="text" 
                        value={productForm.slug}
                        onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110] font-mono"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-gray-500">SEO Meta Description</label>
                      <textarea 
                        rows={2}
                        value={productForm.seoDescription}
                        onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                      />
                    </div>
                  </div>

                  {/* Simulated Google Preview Card */}
                  <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm space-y-1 max-w-xl">
                    <span className="text-[10px] font-mono text-gray-500 block">Google Search Snippet Preview</span>
                    <span className="text-[11px] text-[#1a0dab] font-semibold block hover:underline cursor-pointer truncate">
                      {productForm.seoTitle || `${productForm.name} | TCF Furniture`}
                    </span>
                    <span className="text-[10px] text-[#006621] block truncate font-mono">
                      https://tenalicentralfurniture.com/products/{productForm.slug || 'slug'}
                    </span>
                    <p className="text-[11px] text-[#545454] leading-relaxed line-clamp-2">
                      {productForm.seoDescription || productForm.description || 'No SEO description set yet.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Gallery */}
              {activeProductTab === 'gallery' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Gallery Banners</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('product-gallery');
                        setIsMediaPickerOpen(true);
                      }}
                      className="px-3 py-1 bg-gray-800 text-white font-bold rounded uppercase text-[9px] tracking-wider"
                    >
                      + Add from Media
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-36">
                    {productForm.images.length > 0 ? (
                      productForm.images.map((img, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden relative bg-white group">
                          <div className="aspect-square relative flex items-center justify-center p-1.5">
                            <img src={img} alt="Thumb" className="object-contain max-h-full max-w-full" />
                          </div>
                          
                          {/* Reordering indicators */}
                          <div className="absolute bottom-1.5 right-1.5 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="p-1 bg-white hover:bg-gray-150 rounded border disabled:opacity-40">
                              <ArrowUp className="w-3 h-3 text-gray-700" />
                            </button>
                            <button type="button" onClick={() => moveImage(idx, 'down')} disabled={idx === productForm.images.length - 1} className="p-1 bg-white hover:bg-gray-150 rounded border disabled:opacity-40">
                              <ArrowDown className="w-3 h-3 text-gray-700" />
                            </button>
                            <button type="button" onClick={() => removeProductImage(idx)} className="p-1 bg-white hover:bg-red-50 text-red-500 rounded border">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center text-gray-400 italic">No gallery assets chosen yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Specifications */}
              {activeProductTab === 'specifications' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Furniture Product Specifications</span>
                  
                  {/* Adder form */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-250 items-end">
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase text-gray-500">Label (e.g. Cushion)</span>
                      <input 
                        type="text" 
                        value={newSpecLabel}
                        onChange={(e) => setNewSpecLabel(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 bg-white text-xs rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase text-gray-500">Value (e.g. 40-density)</span>
                      <input 
                        type="text" 
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 bg-white text-xs rounded"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={addSpecField}
                      className="px-3 py-2 bg-gray-800 text-white font-bold text-[10px] uppercase rounded-lg"
                    >
                      Add Spec
                    </button>
                  </div>

                  {/* List specs */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {productForm.specifications?.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white border border-gray-200 p-2.5 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-[#121110]">{s.label}: </span>
                          <span className="text-gray-600">{s.value}</span>
                        </div>
                        <button type="button" onClick={() => removeSpecField(idx)} className="p-1 hover:bg-red-50 text-red-500 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Visibility & Related */}
              {activeProductTab === 'visibility' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase text-gray-500 block">Catalog Visibility & Features</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="w-4 h-4 accent-[#DE2943]"
                        />
                        Featured on Homepage
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={productForm.archived}
                          onChange={(e) => setProductForm({ ...productForm, archived: e.target.checked })}
                          className="w-4 h-4 accent-[#DE2943]"
                        />
                        Archive Catalog Item
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Preview */}
              {activeProductTab === 'preview' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Public Catalog Card Preview</span>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-w-xs shadow-md">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                      {productForm.images?.[0] ? (
                        <img src={productForm.images[0]} alt="Preview" className="object-contain max-h-full max-w-full" />
                      ) : (
                        <span className="text-gray-400 italic text-xs">No image uploaded</span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[9px] font-bold text-[#DE2943] uppercase">{productForm.material}</span>
                      <h4 className="font-serif font-bold text-sm text-[#121110] truncate">{productForm.name || 'Unnamed Product'}</h4>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold font-mono">₹{Number(productForm.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 flex gap-3 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-[#121110] font-bold text-xs uppercase tracking-wider rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-widest rounded-lg"
                >
                  {editingProduct ? 'Save Product changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY ADD/EDIT MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#DE2943]/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-gray-200 bg-[#F5F2EB] flex justify-between items-center">
              <h3 className="text-base font-serif font-bold text-[#121110]">
                {editingCategory ? 'Edit Showroom Category' : 'Add Showroom Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Rocking Chairs"
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Slug (URL Path)</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. rocking-chairs"
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Premium handcrafted solid wood rocking chairs..."
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Banner Image URL</label>
                <input
                  type="text"
                  value={categoryForm.banner}
                  onChange={(e) => setCategoryForm({ ...categoryForm, banner: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-lg text-[#121110]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg text-[#121110]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#DE2943] hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                >
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
