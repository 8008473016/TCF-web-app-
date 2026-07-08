import fs from 'fs';
import path from 'path';

/**
 * Normalizes a folder name into a URL-friendly slug
 */
export function normalizeFolderSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')        // spaces to hyphens
    .replace(/-+/g, '-')         // remove duplicate hyphens
    .trim();
}

/**
 * Gets the absolute path to the product uploads directory,
 * trying multiple possible environment configurations.
 */
export function getProductUploadsDir(): string {
  if (process.env.PRODUCT_UPLOADS_DIR) {
    return process.env.PRODUCT_UPLOADS_DIR;
  }
  
  if (process.env.UPLOADS_BASE_DIR) {
    return path.join(process.env.UPLOADS_BASE_DIR, 'products');
  }
  
  return path.join(process.cwd(), 'public', 'uploads', 'products');
}

export interface ProductFolder {
  folderName: string;
  slug: string;
  absolutePath: string;
  urlPath: string;
}

/**
 * Lists all physical folders in the product uploads directory.
 */
export function listProductFolders(): ProductFolder[] {
  const productsDir = getProductUploadsDir();
  
  if (!fs.existsSync(productsDir)) {
    return [];
  }

  try {
    const folders = fs.readdirSync(productsDir);
    const result: ProductFolder[] = [];
    
    for (const folder of folders) {
      const absolutePath = path.join(productsDir, folder);
      
      try {
        if (fs.statSync(absolutePath).isDirectory()) {
          result.push({
            folderName: folder,
            slug: normalizeFolderSlug(folder),
            absolutePath,
            urlPath: `/uploads/products/${folder}`
          });
        }
      } catch (err) {
        // Skip files that can't be stat'd
        console.error(`[upload-paths] Failed to stat ${absolutePath}:`, err);
      }
    }
    
    return result;
  } catch (err) {
    console.error(`[upload-paths] Failed to read directory ${productsDir}:`, err);
    return [];
  }
}

/**
 * Resolves a requested folder name or slug to an exact physical folder path.
 * Searches first by exact folderName match, then by slug match.
 */
export function resolveProductFolderPath(folderNameOrSlug: string): ProductFolder | null {
  const folders = listProductFolders();
  
  // 1. Try exact folderName match
  const exactMatch = folders.find(f => f.folderName === folderNameOrSlug);
  if (exactMatch) return exactMatch;
  
  // 2. Try exact slug match
  const slugMatch = folders.find(f => f.slug === folderNameOrSlug);
  if (slugMatch) return slugMatch;
  
  // 3. Try normalizing the input as a slug and match
  const normalizedInput = normalizeFolderSlug(folderNameOrSlug);
  const fallbackMatch = folders.find(f => f.slug === normalizedInput);
  if (fallbackMatch) return fallbackMatch;
  
  return null;
}
