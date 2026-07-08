const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const productsDir = path.join(__dirname, '../public/uploads/products');
const dataDir = path.join(__dirname, '../public/uploads/data');
const categoriesFile = path.join(dataDir, 'categories.json');
const productsFile = path.join(dataDir, 'products.json');

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const ADJECTIVES = ['Imperial', 'Royal', 'Majestic', 'Classic', 'Artisan', 'Heritage', 'Signature', 'Premium', 'Elite', 'Opulent', 'Grand', 'Regal', 'Timeless', 'Elegant', 'Luxury', 'Modern'];
const DESCRIPTORS = ['Masterpiece', 'Collection', 'Series', 'Edition', 'Design', 'Craft'];

const makeSafeSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
};

const formatName = (slug) => {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generatePrice = (categoryName) => {
  const cat = categoryName.toLowerCase();
  let base = 20000;
  let max = 45000;
  
  if (cat.includes('sofa')) { base = 35000; max = 85000; }
  else if (cat.includes('dining')) { base = 45000; max = 95000; }
  else if (cat.includes('cot') || cat.includes('bed')) { base = 30000; max = 75000; }
  else if (cat.includes('jula')) { base = 25000; max = 55000; }
  else if (cat.includes('mandir')) { base = 15000; max = 45000; }
  
  // Random price rounded to nearest 500
  const randomPrice = Math.floor(Math.random() * (max - base) + base);
  return Math.round(randomPrice / 500) * 500;
};

const generateDescription = (productName, categoryName) => {
  const cat = categoryName.toLowerCase();
  let material = 'Premium Solid Wood';
  if (cat.includes('teak')) material = 'Grade-A Seasoned Teak Wood';
  if (cat.includes('rosewood')) material = 'Rich Rosewood';
  if (cat.includes('fabric') || cat.includes('cushion')) material = 'Premium Upholstery and Solid Wood';
  
  const intros = [
    `Experience the elegance of the ${productName}.`,
    `Introducing the stunning ${productName}, a true marvel of craftsmanship.`,
    `Elevate your living space with the ${productName}.`,
    `Discover the unparalleled beauty of the ${productName}.`
  ];
  
  const middle = `Carefully handcrafted by our master artisans using ${material}, this exquisite piece from our ${categoryName} collection brings timeless beauty and durability to your home.`;
  
  const endings = [
    `Custom sizes, fabrics, and polish options are available upon request. Direct from the factory in Tenali with our signature 5-year termite warranty.`,
    `Tailor this piece to your exact needs with our custom sizing and premium finishes. Contact our showroom for direct-factory pricing and warranty details.`,
    `Every detail is customizable to perfectly match your interiors. Buy directly from our Tenali workshop for unmatched value and guaranteed quality.`
  ];
  
  return `${getRandomItem(intros)} ${middle} ${getRandomItem(endings)}`;
};

async function updateJson() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let categories = [];
  let products = [];
  
  const usedNames = new Set();

  const physicalFolders = fs.readdirSync(productsDir).filter(f => {
    try {
      return fs.statSync(path.join(productsDir, f)).isDirectory() && f !== '.gitkeep';
    } catch { return false; }
  });

  console.log(`Found ${physicalFolders.length} product folders to process...`);

  let newCats = 0;
  let newProds = 0;

  for (const folderName of physicalFolders) {
    const categorySlug = makeSafeSlug(folderName);
    const categoryName = formatName(folderName);
    
    let existingCat = categories.find(c => c.slug === categorySlug || c.Slug === categorySlug);
    let categoryImage = '';

    const folderPath = path.join(productsDir, folderName);
    const files = fs.readdirSync(folderPath);
    
    // Find images for this category
    const images = files.filter(f => VALID_EXTENSIONS.includes(path.extname(f).toLowerCase()));
    if (images.length > 0) {
      categoryImage = `/uploads/products/${folderName}/${images[0]}`;
    }

    if (!existingCat) {
      existingCat = {
        "id": categories.length + 1,
        "name": categoryName,
        "slug": categorySlug,
        "description": `Explore our beautiful collection of handcrafted ${categoryName}. Discover premium quality furniture designed to last a lifetime.`,
        "image_url": categoryImage,
        "banner": categoryImage,
        "status": "active"
      };
      categories.push(existingCat);
      newCats++;
    } else {
      if (!existingCat.image_url && categoryImage) {
        existingCat.image_url = categoryImage;
        existingCat.banner = categoryImage;
      }
    }

    // Process products in folder
    for (const file of images) {
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);
      
      const imagePath = `/uploads/products/${folderName}/${file}`;
      
      // Generate a highly realistic product name
      // Example: "Imperial Teak Sofa Set", "Majestic Dining Table Edition"
      let singularCategory = categoryName;
      if (singularCategory.toLowerCase().endsWith('s')) singularCategory = singularCategory.slice(0, -1);
      
      let generatedName = `${getRandomItem(ADJECTIVES)} ${singularCategory}`;
      
      // To ensure some variety and uniqueness
      if (Math.random() > 0.5) {
        generatedName += ` ${getRandomItem(DESCRIPTORS)}`;
      }
      
      // If we already generated this name, append a Roman numeral
      let finalName = generatedName;
      let counter = 2;
      while (usedNames.has(finalName)) {
        finalName = `${generatedName} II`; // Simplification, could be III etc.
        // If II is also taken, just add a unique string
        if (usedNames.has(finalName)) {
            finalName = `${generatedName} ${counter}`;
        }
        counter++;
      }
      usedNames.add(finalName);

      const productSlug = makeSafeSlug(finalName);
      const generatedPrice = generatePrice(categoryName);
      // Sale price is 10-15% lower than the generated price
      const saleDiscount = Math.floor(Math.random() * 5) + 10; // 10 to 14 percent
      const salePrice = Math.round((generatedPrice * (1 - (saleDiscount / 100))) / 500) * 500;
      
      let existingProd = {
          "Product ID": `PROD_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          "SKU": `TCF-${categorySlug.substring(0, 3).toUpperCase()}-${products.length + 101}`,
          "Product Name": finalName,
          "Slug": productSlug,
          "Category": categorySlug,
          "Description": generateDescription(finalName, categoryName),
          "Price": generatedPrice,
          "Sale Price": salePrice,
          "Stock": Math.floor(Math.random() * 8) + 2, // 2 to 9
          "Material": categoryName.toLowerCase().includes('teak') ? "Teak Wood" : "Solid Wood",
          "Dimensions": "Standard (Customizable)",
          "Weight": Math.floor(Math.random() * 20) + 25, // 25 to 44
          "Images": imagePath,
          "Featured": Math.random() > 0.8 ? "TRUE" : "FALSE",
          "SEO Title": `${finalName} | ${categoryName} | TCF Handcrafted`,
          "SEO Description": `Buy customized ${finalName} directly from the factory at TCF. Termite warranty included.`,
          "Archived": "false",
          "ai_generated": true
      };
      
      products.push(existingProd);
      newProds++;
    }
  }

  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

  console.log(`Updated JSON Database with Realistic Names & Prices.`);
  console.log(`Added ${newCats} new categories.`);
  console.log(`Added/Updated ${newProds} new products.`);
  console.log(`Total Categories: ${categories.length}`);
  console.log(`Total Products: ${products.length}`);
}

updateJson().catch(console.error);
