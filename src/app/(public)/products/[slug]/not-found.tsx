import Link from 'next/link';
import { PackageX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white">
      <PackageX className="w-16 h-16 text-tcf-sand mb-6" />
      <h2 className="text-3xl font-serif font-black text-tcf-dark mb-4">Product Not Found</h2>
      <p className="text-tcf-dark/70 mb-8 max-w-md mx-auto font-light leading-relaxed">
        We couldn't find the product you're looking for. It may have been removed, archived, or the URL might be incorrect.
      </p>
      <Link 
        href="/products"
        className="px-8 py-3 bg-tcf-red text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors shadow-premium"
      >
        Browse Our Catalog
      </Link>
    </div>
  );
}
