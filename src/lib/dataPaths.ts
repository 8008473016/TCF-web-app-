import path from 'path';

const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'src/data');

export const dataPaths = {
  products: path.resolve(dataDir, 'products.json'),
  categories: path.resolve(dataDir, 'categories.json'),
  orders: path.resolve(dataDir, 'orders.json'),
  leads: path.resolve(dataDir, 'leads.json'),
  blogs: path.resolve(dataDir, 'blogs.json'),
  settings: path.resolve(dataDir, 'settings.json'),
  analytics: path.resolve(dataDir, 'analytics.json'),
  media: path.resolve(dataDir, 'media.json'),
};
