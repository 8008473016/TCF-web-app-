'use client';

import React, { useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Calendar, Tag } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  bannerImage: string;
  tags: string[];
  createdAt: string;
}

interface BlogsListingClientProps {
  initialBlogs: Blog[];
}

const BlogsListingContent: React.FC<BlogsListingClientProps> = ({ initialBlogs }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Tag filter
  const tagParam = searchParams.get('tag');

  // Derive unique tags
  const allTags = useMemo(() => {
    const list = new Set<string>();
    initialBlogs.forEach(b => {
      if (b.tags && Array.isArray(b.tags)) {
        b.tags.forEach(t => list.add(t));
      }
    });
    return Array.from(list);
  }, [initialBlogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    if (tagParam) {
      return initialBlogs.filter(b => b.tags && b.tags.includes(tagParam));
    }
    return initialBlogs;
  }, [initialBlogs, tagParam]);

  const handleTagSelect = (tag: string | null) => {
    if (tag) {
      router.push(`${pathname}?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Page Header */}
          <div className="bg-white border border-tcf-sand p-8 shadow-premium space-y-2 rounded-2xl">
            <span className="text-tcf-red text-xs font-bold uppercase tracking-[0.2em]">Inspiration & Advice</span>
            <h1 className="text-3xl font-serif font-black text-tcf-dark">
              {tagParam ? `Articles Tagged #${tagParam}` : 'The TCF Design Journal'}
            </h1>
            <p className="text-sm text-tcf-dark/70 leading-relaxed font-light">
              Tips on selecting wood, maintenance, space layouts, and home decor guides straight from our Tenali manufacturers.
            </p>
          </div>

          {filteredBlogs.length === 0 ? (
            <p className="italic text-tcf-dark/50 text-center py-10 bg-white border border-tcf-sand rounded-2xl">
              No articles found in this section.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredBlogs.map(blog => (
                <Link 
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="group bg-white border border-tcf-sand hover:shadow-luxury overflow-hidden flex flex-col h-full rounded-2xl transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden relative bg-tcf-light">
                    <Image 
                      src={blog.bannerImage || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80'} 
                      alt={blog.title} 
                      fill
                      sizes="(max-w-7xl) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] text-tcf-dark/50 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-tcf-red" /> {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-tcf-dark line-clamp-2 group-hover:text-tcf-red transition-colors">
                        {blog.title}
                      </h3>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-tcf-sand">
                      <span className="text-xs text-tcf-red font-bold uppercase tracking-wider">Read Article →</span>
                      <span className="text-[9px] text-tcf-red font-semibold uppercase tracking-wider">
                        By {blog.author.split(',')[0]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tags sidebar */}
        <aside className="space-y-6">
          <div className="bg-white border border-tcf-sand p-6 shadow-premium space-y-4 rounded-2xl">
            <h3 className="font-serif font-bold text-base text-tcf-dark border-b border-tcf-sand pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-tcf-red" /> Filter by Tag
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagSelect(null)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 cursor-pointer ${
                  !tagParam 
                    ? 'bg-tcf-red text-white border-tcf-red' 
                    : 'bg-tcf-light border-tcf-sand text-tcf-dark/70 hover:border-tcf-red'
                }`}
              >
                All Tags
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 cursor-pointer ${
                    tagParam === tag 
                      ? 'bg-tcf-red text-white border-tcf-red' 
                      : 'bg-tcf-light border-tcf-sand text-tcf-dark/70 hover:border-tcf-red'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export const BlogsListingClient: React.FC<BlogsListingClientProps> = (props) => {
  return (
    <Suspense fallback={<div className="text-center py-20 font-serif">Loading blogs feeds...</div>}>
      <BlogsListingContent {...props} />
    </Suspense>
  );
};
