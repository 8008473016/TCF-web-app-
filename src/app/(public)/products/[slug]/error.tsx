'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white">
      <h2 className="text-2xl font-serif font-bold text-red-600 mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-2 font-mono text-sm max-w-xl mx-auto border p-4 bg-gray-50 rounded">
        {error.message || 'An unexpected error occurred while loading this product.'}
      </p>
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-tcf-dark text-white rounded hover:bg-black transition-colors text-sm"
        >
          Try again
        </button>
        <Link 
          href="/products"
          className="px-6 py-2 border border-tcf-dark text-tcf-dark rounded hover:bg-gray-50 transition-colors text-sm"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );
}
