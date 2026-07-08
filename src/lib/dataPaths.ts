import path from 'path';

export const dataPaths = {
  products: path.resolve(process.cwd(), 'public/uploads/data/products.json'),
  categories: path.resolve(process.cwd(), 'public/uploads/data/categories.json'),
  orders: path.resolve(process.cwd(), 'public/uploads/data/orders.json'),
  leads: path.resolve(process.cwd(), 'public/uploads/data/leads.json'),
  blogs: path.resolve(process.cwd(), 'public/uploads/data/blogs.json'),
  settings: path.resolve(process.cwd(), 'public/uploads/data/settings.json'),
  analytics: path.resolve(process.cwd(), 'public/uploads/data/analytics.json'),
  media: path.resolve(process.cwd(), 'public/uploads/data/media.json'),
  reviews: path.resolve(process.cwd(), 'public/uploads/data/reviews.json'),
};
