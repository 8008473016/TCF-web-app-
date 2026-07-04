import path from 'path';

export const dataPaths = {
  products: path.resolve(process.cwd(), 'src/data/products.json'),
  categories: path.resolve(process.cwd(), 'src/data/categories.json'),
  orders: path.resolve(process.cwd(), 'src/data/orders.json'),
  leads: path.resolve(process.cwd(), 'src/data/leads.json'),
  blogs: path.resolve(process.cwd(), 'src/data/blogs.json'),
  settings: path.resolve(process.cwd(), 'src/data/settings.json'),
  analytics: path.resolve(process.cwd(), 'src/data/analytics.json'),
  media: path.resolve(process.cwd(), 'src/data/media.json'),
};
