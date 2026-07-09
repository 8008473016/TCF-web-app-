import { getMySqlPool } from './mysql';

const mapToMysql: Record<string, Record<string, string>> = {
  products: {
    'Product ID': 'id',
    'id': 'id',
    'SKU': 'sku',
    'sku': 'sku',
    'Product Name': 'name',
    'name': 'name',
    'Slug': 'slug',
    'slug': 'slug',
    'Category': 'category',
    'category': 'category',
    'Description': 'description',
    'description': 'description',
    'Price': 'price',
    'price': 'price',
    'Sale Price': 'sale_price',
    'salePrice': 'sale_price',
    'Stock': 'stock',
    'stock': 'stock',
    'Material': 'material',
    'material': 'material',
    'Dimensions': 'dimensions',
    'dimensions': 'dimensions',
    'Weight': 'weight',
    'weight': 'weight',
    'Images': 'images',
    'images': 'images',
    'Featured': 'featured',
    'featured': 'featured',
    'Archived': 'archived',
    'archived': 'archived',
    'SEO Title': 'seo_title',
    'seoTitle': 'seo_title',
    'SEO Description': 'seo_description',
    'seoDescription': 'seo_description',
    'Date': 'created_at',
    'createdAt': 'created_at',
  },
  categories: {
    'Category ID': 'id',
    'id': 'id',
    'Category Name': 'name',
    'name': 'name',
    'Slug': 'slug',
    'slug': 'slug',
    'Description': 'description',
    'description': 'description',
    'Banner': 'banner',
    'banner': 'banner',
    'Image': 'image_url',
    'image_url': 'image_url',
    'Status': 'status',
    'status': 'status',
    'Sort Order': 'sort_order',
    'sort_order': 'sort_order',
    'Archived': 'archived',
    'archived': 'archived',
    'Date': 'created_at',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
  },
  blogs: {
    'Blog ID': 'id',
    'id': 'id',
    'Title': 'title',
    'title': 'title',
    'Slug': 'slug',
    'slug': 'slug',
    'Excerpt': 'excerpt',
    'excerpt': 'excerpt',
    'Content': 'content',
    'content': 'content',
    'Image': 'image',
    'image': 'image',
    'Author': 'author',
    'author': 'author',
    'Published': 'published',
    'published': 'published',
    'SEO Title': 'seo_title',
    'seoTitle': 'seo_title',
    'SEO Description': 'seo_description',
    'seoDescription': 'seo_description',
    'Date': 'created_at',
    'createdAt': 'created_at',
  },
  settings: {
    'Key': 'setting_key',
    'key': 'setting_key',
    'Value': 'setting_value',
    'value': 'setting_value',
  },
  reviews: {
    'id': 'id',
    'productId': 'product_id',
    'customerName': 'customer_name',
    'rating': 'rating',
    'reviewText': 'review_text',
    'createdAt': 'created_at',
  },
  leads: {
    'id': 'id',
    'customerName': 'customer_name',
    'phone': 'phone',
    'email': 'email',
    'productId': 'product_id',
    'message': 'message',
    'source': 'source',
    'status': 'status',
    'createdAt': 'created_at',
  },
  media: {
    'id': 'id',
    'filename': 'filename',
    'originalName': 'original_name',
    'path': 'path',
    'url': 'url',
    'category': 'category',
    'size': 'size',
    'createdAt': 'created_at',
  },
  analytics: {
    'id': 'id',
    'page': 'page',
    'eventType': 'event_type',
    'metadata': 'metadata',
    'createdAt': 'created_at',
  }
};

const mapFromMysql: Record<string, Record<string, string>> = {
  products: {
    'id': 'Product ID',
    'sku': 'SKU',
    'name': 'Product Name',
    'slug': 'Slug',
    'category': 'Category',
    'description': 'Description',
    'price': 'Price',
    'sale_price': 'Sale Price',
    'stock': 'Stock',
    'material': 'Material',
    'dimensions': 'Dimensions',
    'weight': 'Weight',
    'images': 'Images',
    'featured': 'Featured',
    'archived': 'Archived',
    'seo_title': 'SEO Title',
    'seo_description': 'SEO Description',
    'created_at': 'Date',
  },
  categories: {
    'id': 'Category ID',
    'name': 'Category Name',
    'slug': 'Slug',
    'description': 'Description',
    'image_url': 'Image',
    'banner': 'Banner',
    'status': 'Status',
    'sort_order': 'Sort Order',
    'archived': 'Archived',
    'created_at': 'Date',
    'updated_at': 'updatedAt',
  },
  blogs: {
    'id': 'Blog ID',
    'title': 'Title',
    'slug': 'Slug',
    'excerpt': 'Excerpt',
    'content': 'Content',
    'image': 'Image',
    'author': 'Author',
    'published': 'Published',
    'seo_title': 'SEO Title',
    'seo_description': 'SEO Description',
    'created_at': 'Date',
  },
  settings: {
    'setting_key': 'Key',
    'setting_value': 'Value',
  },
  reviews: {
    'id': 'id',
    'product_id': 'productId',
    'customer_name': 'customerName',
    'rating': 'rating',
    'review_text': 'reviewText',
    'created_at': 'createdAt',
  },
  leads: {
    'id': 'id',
    'customer_name': 'customerName',
    'phone': 'phone',
    'email': 'email',
    'product_id': 'productId',
    'message': 'message',
    'source': 'source',
    'status': 'status',
    'created_at': 'createdAt',
  },
  media: {
    'id': 'id',
    'filename': 'filename',
    'original_name': 'originalName',
    'path': 'path',
    'url': 'url',
    'category': 'category',
    'size': 'size',
    'created_at': 'createdAt',
  },
  analytics: {
    'id': 'id',
    'page': 'page',
    'event_type': 'eventType',
    'metadata': 'metadata',
    'created_at': 'createdAt',
  }
};

const booleanFields = ['featured', 'archived', 'published'];
const jsonFields = ['images', 'setting_value', 'metadata'];

function formatForInsert(tableName: string, data: any) {
  const mapping = mapToMysql[tableName] || {};
  const formatted: any = {};
  for (const [key, val] of Object.entries(data)) {
    const colName = mapping[key];
    if (colName) {
      let finalVal = val;
      if (booleanFields.includes(colName)) {
        finalVal = String(val).toLowerCase() === 'true' ? 1 : 0;
      }
      if (jsonFields.includes(colName)) {
        finalVal = typeof val === 'string' ? val : JSON.stringify(val);
      }
      // For string arrays stored as JSON, ensure it's a JSON string.
      // E.g. Images field in products
      if (colName === 'images' && Array.isArray(val)) {
         finalVal = JSON.stringify(val);
      } else if (colName === 'images' && typeof val === 'string' && !val.startsWith('[')) {
         // It might be a comma separated list
         finalVal = JSON.stringify(val.split(',').map(s => s.trim()).filter(Boolean));
      }

      formatted[colName] = finalVal;
    }
  }
  return formatted;
}

function formatFromResult(tableName: string, row: any) {
  const mapping = mapFromMysql[tableName] || {};
  const formatted: any = {};
  for (const [colName, val] of Object.entries(row)) {
    const jsonKey = mapping[colName] || colName;
    let finalVal = val;
    
    if (booleanFields.includes(colName)) {
      finalVal = Boolean(val) ? 'true' : 'false'; // The frontend expects 'true'/'false' strings
    } else if (jsonFields.includes(colName)) {
      if (typeof val === 'string') {
        try { finalVal = JSON.parse(val); } catch (e) { finalVal = val; }
      }
      if (colName === 'images' && Array.isArray(finalVal)) {
        finalVal = finalVal.join(','); // The frontend expects comma-separated for some reason, or arrays.
      }
    } else if (val === null) {
       finalVal = '';
    }

    formatted[jsonKey] = finalVal;
    // Also inject the camelCase version for frontend compat if missing
    // if (jsonKey === 'Product ID') formatted['id'] = finalVal; // handled by route mapping usually
  }
  return formatted;
}

export const dbMysql = {
  read: async (tableName: string): Promise<any[]> => {
    try {
      const db = getMySqlPool();
      const [rows] = await db.query(`SELECT * FROM \`${tableName}\``) as any[];
      return rows.map((row: any) => formatFromResult(tableName, row));
    } catch (error) {
      console.error(`[MySQL Error] Failed to read ${tableName}:`, error);
      return [];
    }
  },

  insert: async (tableName: string, data: any): Promise<any> => {
    try {
      const db = getMySqlPool();
      const formatted = formatForInsert(tableName, data);
      
      const keys = Object.keys(formatted);
      if (keys.length === 0) return data;

      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => formatted[k]);
      
      const query = `INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
      await db.execute(query, values);
      
      return data;
    } catch (error) {
      console.error(`[MySQL Error] Failed to insert into ${tableName}:`, error);
      return null;
    }
  },

  update: async (tableName: string, keyField: string, keyValue: string, updateData: any): Promise<any> => {
    try {
      const db = getMySqlPool();
      const formatted = formatForInsert(tableName, updateData);
      
      // Find the primary key column for the WHERE clause
      const mapping = mapToMysql[tableName] || {};
      const pkCol = mapping[keyField] || keyField;

      const keys = Object.keys(formatted);
      if (keys.length === 0) return updateData;

      const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
      const values = keys.map(k => formatted[k]);
      values.push(keyValue);

      const query = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`${pkCol}\` = ?`;
      await db.execute(query, values);
      
      return { ...updateData, [keyField]: keyValue };
    } catch (error) {
      console.error(`[MySQL Error] Failed to update ${tableName} [${keyField}=${keyValue}]:`, error);
      return null;
    }
  },

  delete: async (tableName: string, keyField: string, keyValue: string): Promise<boolean> => {
    try {
      const db = getMySqlPool();
      const mapping = mapToMysql[tableName] || {};
      const pkCol = mapping[keyField] || keyField;

      const query = `DELETE FROM \`${tableName}\` WHERE \`${pkCol}\` = ?`;
      const [result]: any = await db.execute(query, [keyValue]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`[MySQL Error] Failed to delete from ${tableName} [${keyField}=${keyValue}]:`, error);
      return false;
    }
  }
};
