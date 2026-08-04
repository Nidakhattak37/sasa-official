import { Product, Category, Order, Coupon, Review, Banner, Customer, StoreSettings, CMSPage } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Mah-e-Noor Velvet Embroidered Kurta Set',
    slug: 'mah-e-noor-velvet-kurta',
    price: 24500,
    originalPrice: 28500,
    category: 'Luxury Pret',
    subcategory: 'Festive Wear',
    collection: 'Winter Velvet Royale',
    description: 'An exquisite royal navy micro-velvet tunic intricately embroidered with tilla and dabka handiwork around the neckline and sleeves. Styled with custom tailored raw silk pants and a tissue organza dupatta.',
    fabricDetails: 'Top: 100% Micro Velvet | Dupatta: Sheer Tissue Organza | Bottom: Pure Raw Silk',
    careInstructions: 'Dry Clean Only. Steam iron on reverse.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom Stitching'],
    colors: [
      { name: 'Royal Navy', hex: '#1B263B' },
      { name: 'Deep Emerald', hex: '#133C27' },
      { name: 'Plum Rose', hex: '#4A1525' }
    ],
    sku: 'SASA-LP-001',
    stock: 18,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isSale: true,
    tags: ['Velvet', 'Festive', 'Embroidered', 'Luxury Pret'],
    rating: 4.9,
    reviewsCount: 38,
    createdAt: '2026-07-15'
  },
  {
    id: 'prod-2',
    name: 'Zaria Chiffon Floral Embroidered 3-Piece',
    slug: 'zaria-chiffon-floral-3piece',
    price: 18900,
    originalPrice: 21000,
    category: 'Pret',
    subcategory: 'Ready to Wear',
    collection: 'Summer Gardenia',
    description: 'A delicate dusty rose pure crinkle chiffon shirt featuring intricate pastel floral embroidery with subtle sequin accents. Comes complete with a printed chiffon dupatta and tulip trousers.',
    fabricDetails: 'Top: Pure Crinkle Chiffon | Dupatta: Soft Printed Chiffon | Bottom: Grip Silk',
    careInstructions: 'Dry clean recommended. Cool iron.',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Dusty Rose', hex: '#D8A48F' },
      { name: 'Sage Mint', hex: '#A3B18A' }
    ],
    sku: 'SASA-PR-002',
    stock: 24,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isSale: false,
    tags: ['Pret', 'Floral', 'Chiffon', 'Ready to Wear'],
    rating: 4.8,
    reviewsCount: 42,
    createdAt: '2026-07-20'
  },
  {
    id: 'prod-3',
    name: 'Noor-e-Sehar Unstitched 3-Piece Lawn',
    slug: 'noor-e-sehar-unstitched-lawn',
    price: 8950,
    category: 'Unstitched',
    subcategory: 'Lawn Suits',
    collection: 'Lawn Heritage II',
    description: 'Premium Pima Swiss lawn unstitched shirt piece with Schiffli laser-cut embroidered neckline, digital silk printed dupatta, and plain dyed lawn trouser fabric.',
    fabricDetails: 'Shirt: 3.0M Pima Swiss Lawn | Dupatta: 2.5M Digital Silk | Trouser: 2.5M Cambric Cotton',
    careInstructions: 'Hand wash in cold water with mild detergent. Do not bleach.',
    images: [
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['Unstitched'],
    colors: [
      { name: 'Ivory Gold', hex: '#EAE4DC' },
      { name: 'Sky Blue', hex: '#A0C4FF' }
    ],
    sku: 'SASA-US-003',
    stock: 45,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isSale: false,
    tags: ['Unstitched', 'Lawn', 'Schiffli', 'Digital Silk'],
    rating: 4.7,
    reviewsCount: 19,
    createdAt: '2026-07-25'
  },
  {
    id: 'prod-4',
    name: 'Gulzar Silk Organza Jacket & Inner',
    slug: 'gulzar-silk-organza-jacket',
    price: 32000,
    originalPrice: 36500,
    category: 'Luxury Pret',
    subcategory: 'Couture',
    collection: 'Royal Heritage',
    description: 'Statement open front organza jacket layered with cutwork thread embroidery, hand-set mirror work, and pearls. Paired with a floor-length sleeveless silk slip and wide-leg trousers.',
    fabricDetails: 'Jacket: Pure Sheer Organza | Slip & Pants: Raw Silk 80g',
    careInstructions: 'Dry Clean Only.',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['S', 'M', 'L', 'Custom Stitching'],
    colors: [
      { name: 'Champagne Gold', hex: '#D4AF37' },
      { name: 'Midnight Black', hex: '#222222' }
    ],
    sku: 'SASA-LP-004',
    stock: 8,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isSale: true,
    tags: ['Organza', 'Luxury Pret', 'Formal', 'Jacket'],
    rating: 5.0,
    reviewsCount: 29,
    createdAt: '2026-06-30'
  },
  {
    id: 'prod-5',
    name: 'Rosheen Cotton Net Block Print Kurta',
    slug: 'rosheen-cotton-net-kurta',
    price: 11500,
    category: 'Pret',
    subcategory: 'Daily Pret',
    collection: 'Artisanal Block Prints',
    description: 'Handcrafted wooden block printed cotton net straight tunic styled with hand-tied crochet tassel lace on cuffs and hem. Lightweight and effortlessly elegant for daytime wear.',
    fabricDetails: 'Top: 100% Cotton Net | Dupatta: Soft Kota Doria',
    careInstructions: 'Wash separately in cold water.',
    images: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Warm Terracotta', hex: '#C86D51' },
      { name: 'Olive Green', hex: '#6B705C' }
    ],
    sku: 'SASA-PR-005',
    stock: 32,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    isSale: false,
    tags: ['Block Print', 'Cotton Net', 'Summer', 'Pret'],
    rating: 4.6,
    reviewsCount: 15,
    createdAt: '2026-07-28'
  },
  {
    id: 'prod-6',
    name: 'Bahar Jacquard Unstitched 2-Piece',
    slug: 'bahar-jacquard-unstitched-2piece',
    price: 6950,
    originalPrice: 7950,
    category: 'Unstitched',
    subcategory: '2-Piece',
    collection: 'Casual Elegance',
    description: 'Gold-woven self-jacquard lawn shirt piece featuring an embroidered organza border patch, paired with a matching printed lawn trouser.',
    fabricDetails: 'Shirt: Self Gold Jacquard Lawn 2.5M | Trouser: Dyed Lawn 2.5M',
    careInstructions: 'Machine wash delicate cycle.',
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['Unstitched'],
    colors: [
      { name: 'Dusty Lilac', hex: '#C8B6E2' },
      { name: 'Butter Cream', hex: '#F7EDE2' }
    ],
    sku: 'SASA-US-006',
    stock: 50,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isSale: true,
    tags: ['Jacquard', '2 Piece', 'Unstitched', 'Sale'],
    rating: 4.5,
    reviewsCount: 22,
    createdAt: '2026-06-15'
  },
  {
    id: 'prod-7',
    name: 'Shahzadi Embellished Raw Silk Kaftan',
    slug: 'shahzadi-embellished-raw-silk-kaftan',
    price: 29500,
    category: 'Luxury Pret',
    subcategory: 'Evening Wear',
    collection: 'Bridal Heritage',
    description: 'Flowing pure raw silk kaftan accented with traditional zardozi work, crystals, and gold thread motifs across the V-neckline and sides.',
    fabricDetails: 'Pure Raw Silk 80g | Inner Lining: Soft Crepe',
    careInstructions: 'Dry Clean Only.',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['Free Size', 'Custom Stitching'],
    colors: [
      { name: 'Emerald Green', hex: '#0B6623' },
      { name: 'Deep Carmine', hex: '#960018' }
    ],
    sku: 'SASA-LP-007',
    stock: 12,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isSale: false,
    tags: ['Kaftan', 'Raw Silk', 'Zardozi', 'Festive'],
    rating: 4.9,
    reviewsCount: 31,
    createdAt: '2026-07-30'
  },
  {
    id: 'prod-8',
    name: 'Handcrafted Zari Embroidered Velvet Clutch',
    slug: 'handcrafted-zari-velvet-clutch',
    price: 5500,
    category: 'Accessories',
    subcategory: 'Bags & Clutches',
    collection: 'Royal Heritage',
    description: 'Handmade luxury velvet evening box clutch featuring detailed antique gold zari work, magnetic clasp, and detachable chain strap.',
    fabricDetails: 'Outer: Royal Velvet | Frame: Brass Gold Hardware',
    careInstructions: 'Wipe clean with a soft dry cloth.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'Ruby Velvet', hex: '#800020' },
      { name: 'Jet Black', hex: '#111111' }
    ],
    sku: 'SASA-ACC-008',
    stock: 30,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isSale: false,
    tags: ['Accessories', 'Clutch', 'Handmade', 'Velvet'],
    rating: 4.9,
    reviewsCount: 54,
    createdAt: '2026-05-10'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-new',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    description: 'Discover the latest hand-embroidered silhouettes and seasonal drops.',
    isFeatured: true,
    subcategories: ['Pret Drops', 'Festive Edit', 'New Unstitched']
  },
  {
    id: 'cat-pret',
    name: 'Pret',
    slug: 'pret',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    description: 'Effortless everyday ready-to-wear kurtas, sets, and co-ords.',
    isFeatured: true,
    subcategories: ['Daily Pret', 'Ready to Wear', 'Cotton Sets', 'Printed Tunics']
  },
  {
    id: 'cat-luxpret',
    name: 'Luxury Pret',
    slug: 'luxury-pret',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    description: 'Opulent silk, chiffon, and velvet tailored formals for special occasions.',
    isFeatured: true,
    subcategories: ['Festive Wear', 'Evening Kaftans', 'Couture Jackets', 'Formals']
  },
  {
    id: 'cat-unstitched',
    name: 'Unstitched',
    slug: 'unstitched',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800',
    description: 'Unstitched 3-piece and 2-piece lawn, chiffon, and organza suit fabrics.',
    isFeatured: true,
    subcategories: ['3-Piece Lawn', '2-Piece Jacquard', 'Silk Dupatta Suits', 'Chiffon Unstitched']
  },
  {
    id: 'cat-acc',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    description: 'Handmade velvet clutches, organza shawls, and statement dupattas.',
    isFeatured: false,
    subcategories: ['Bags & Clutches', 'Shawls', 'Dupattas', 'Jewelry']
  },
  {
    id: 'cat-sale',
    name: 'Sale',
    slug: 'sale',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
    description: 'Up to 40% OFF on select seasonal pret and unstitched items.',
    isFeatured: true,
    subcategories: ['Pret Sale', 'Unstitched Sale', 'Final Clearout']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SASA-9842',
    customerName: 'Ayesha Khan',
    email: 'ayesha.khan@gmail.com',
    phone: '+92 301 8472910',
    shippingAddress: {
      fullName: 'Ayesha Khan',
      email: 'ayesha.khan@gmail.com',
      phone: '+92 301 8472910',
      street: 'House 42, Block B, Gulberg III',
      city: 'Lahore',
      state: 'Punjab',
      postalCode: '54000',
      country: 'Pakistan'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Mah-e-Noor Velvet Embroidered Kurta Set',
        selectedSize: 'M',
        selectedColor: 'Royal Navy',
        quantity: 1,
        price: 24500,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400'
      }
    ],
    subtotal: 24500,
    discount: 2450,
    couponCode: 'SASA10',
    shippingFee: 0,
    tax: 0,
    total: 22050,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Shipped',
    trackingCode: 'SASA-TRK-9842-LHR',
    estimatedDeliveryDate: '2026-08-06',
    createdAt: '2026-08-01 14:30',
    customerNotes: 'Please call before delivery.',
    adminNotes: 'Dispatched via TCS Express Air.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-08-01 14:30', description: 'Order successfully placed via Cash on Delivery', completed: true },
      { status: 'Packed', timestamp: '2026-08-02 10:15', description: 'Order packaged nicely in signature SASA box', completed: true },
      { status: 'Shipped', timestamp: '2026-08-02 17:45', description: 'Handed over to TCS Courier (Tracking: SASA-TRK-9842-LHR)', completed: true },
      { status: 'Out for Delivery', timestamp: '2026-08-04', description: 'Rider scheduled for delivery', completed: false },
      { status: 'Delivered', timestamp: '', description: 'Package signed and delivered', completed: false }
    ]
  },
  {
    id: 'SASA-9841',
    customerName: 'Fatima Malik',
    email: 'fatima.m@outlook.com',
    phone: '+92 322 9102837',
    shippingAddress: {
      fullName: 'Fatima Malik',
      email: 'fatima.m@outlook.com',
      phone: '+92 322 9102837',
      street: 'Apartment 4B, Clifton Block 5',
      city: 'Karachi',
      state: 'Sindh',
      postalCode: '75600',
      country: 'Pakistan'
    },
    items: [
      {
        productId: 'prod-2',
        productName: 'Zaria Chiffon Floral Embroidered 3-Piece',
        selectedSize: 'S',
        selectedColor: 'Dusty Rose',
        quantity: 1,
        price: 18900,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400'
      },
      {
        productId: 'prod-8',
        productName: 'Handcrafted Zari Embroidered Velvet Clutch',
        selectedSize: 'One Size',
        selectedColor: 'Ruby Velvet',
        quantity: 1,
        price: 5500,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400'
      }
    ],
    subtotal: 24400,
    discount: 0,
    shippingFee: 0,
    tax: 0,
    total: 24400,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    trackingCode: 'SASA-TRK-9841-KHI',
    estimatedDeliveryDate: '2026-08-02',
    createdAt: '2026-07-29 11:20',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-07-29 11:20', description: 'Payment authorized via Credit Card', completed: true },
      { status: 'Packed', timestamp: '2026-07-29 16:00', description: 'Inspected and packed', completed: true },
      { status: 'Shipped', timestamp: '2026-07-30 09:30', description: 'Dispatched via Leopard Courier', completed: true },
      { status: 'Out for Delivery', timestamp: '2026-07-31 08:30', description: 'Out with delivery rider', completed: true },
      { status: 'Delivered', timestamp: '2026-07-31 15:40', description: 'Delivered & signed by customer', completed: true }
    ]
  },
  {
    id: 'SASA-9840',
    customerName: 'Zainab Qureshi',
    email: 'zainab.q@gmail.com',
    phone: '+92 333 5519283',
    shippingAddress: {
      fullName: 'Zainab Qureshi',
      email: 'zainab.q@gmail.com',
      phone: '+92 333 5519283',
      street: 'House 19, Sector F-7/2',
      city: 'Islamabad',
      state: 'ICT',
      postalCode: '44000',
      country: 'Pakistan'
    },
    items: [
      {
        productId: 'prod-3',
        productName: 'Noor-e-Sehar Unstitched 3-Piece Lawn',
        selectedSize: 'Unstitched',
        selectedColor: 'Ivory Gold',
        quantity: 2,
        price: 8950,
        image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=400'
      }
    ],
    subtotal: 17900,
    discount: 1790,
    couponCode: 'WELCOME15',
    shippingFee: 0,
    tax: 0,
    total: 16110,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Packed',
    trackingCode: 'SASA-TRK-9840-ISB',
    estimatedDeliveryDate: '2026-08-07',
    createdAt: '2026-08-02 09:15',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-08-02 09:15', description: 'Order confirmed', completed: true },
      { status: 'Packed', timestamp: '2026-08-03 11:00', description: 'Order packed in warehouse', completed: true },
      { status: 'Shipped', timestamp: '', description: 'Pending pickup by courier', completed: false },
      { status: 'Out for Delivery', timestamp: '', description: 'Pending', completed: false },
      { status: 'Delivered', timestamp: '', description: 'Pending', completed: false }
    ]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'SASA10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 5000,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    timesUsed: 142,
    isActive: true
  },
  {
    id: 'coup-2',
    code: 'WELCOME15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 8000,
    expiryDate: '2026-09-30',
    usageLimit: 200,
    timesUsed: 89,
    isActive: true
  },
  {
    id: 'coup-3',
    code: 'FREESHIP',
    discountType: 'free_shipping',
    discountValue: 0,
    minOrderValue: 4000,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    timesUsed: 310,
    isActive: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Mah-e-Noor Velvet Embroidered Kurta Set',
    customerName: 'Sadaf R.',
    customerEmail: 'sadaf@gmail.com',
    rating: 5,
    comment: 'The velvet fabric is so plush and high quality! Stitching fits like a dream. SASA never disappoints with packing either.',
    date: '2026-07-28',
    status: 'Approved',
    adminReply: 'Thank you Sadaf! We are thrilled that you loved the velvet craftsmanship.'
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productName: 'Zaria Chiffon Floral Embroidered 3-Piece',
    customerName: 'Hira Tariq',
    customerEmail: 'hira.t@yahoo.com',
    rating: 5,
    comment: 'Wore this to a mehendi function in Islamabad and received so many compliments! True to picture.',
    date: '2026-07-29',
    status: 'Approved'
  },
  {
    id: 'rev-3',
    productId: 'prod-4',
    productName: 'Gulzar Silk Organza Jacket & Inner',
    customerName: 'Mariam Ali',
    customerEmail: 'mariam.a@gmail.com',
    rating: 5,
    comment: 'Breathtaking embroidery and finish. Worth every single penny.',
    date: '2026-07-31',
    status: 'Approved'
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'Timeless Pakistani Fashion',
    subtitle: 'Crafted with Elegance & Heritage Artistry',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Explore New Collection',
    ctaLink: 'shop',
    isActive: true
  },
  {
    id: 'ban-2',
    title: 'The Velvet Royale Collection',
    subtitle: 'Opulent Micro-Velvet & Zardozi Handwork',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Shop Luxury Pret',
    ctaLink: 'shop',
    isActive: true
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ayesha Khan',
    email: 'ayesha.khan@gmail.com',
    phone: '+92 301 8472910',
    totalOrders: 4,
    totalSpent: 92400,
    city: 'Lahore',
    createdAt: '2026-01-12'
  },
  {
    id: 'cust-2',
    name: 'Fatima Malik',
    email: 'fatima.m@outlook.com',
    phone: '+92 322 9102837',
    totalOrders: 3,
    totalSpent: 68900,
    city: 'Karachi',
    createdAt: '2026-02-19'
  },
  {
    id: 'cust-3',
    name: 'Zainab Qureshi',
    email: 'zainab.q@gmail.com',
    phone: '+92 333 5519283',
    totalOrders: 2,
    totalSpent: 34000,
    city: 'Islamabad',
    createdAt: '2026-04-05'
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'SASA Official',
  email: 'care@sasaofficial.com',
  phone: '+92 42 111 727 200',
  address: 'SASA House, M.M. Alam Road, Gulberg III, Lahore, Pakistan',
  currency: 'PKR',
  freeShippingThreshold: 10000,
  defaultShippingFee: 250,
  taxRate: 0,
  announcementBarText: '✨ FREE EXPRESS DELIVERY ON ORDERS OVER PKR 10,000 | CASH ON DELIVERY AVAILABLE NATIONWIDE',
  enableCOD: true,
  enableCard: true
};

export const INITIAL_CMS_PAGES: CMSPage[] = [
  {
    id: 'cms-about',
    slug: 'about',
    title: 'About SASA Official',
    content: `SASA Official is a premier Pakistani fashion powerhouse born out of a passion for heritage craft and modern minimalism. 

Our collections seamlessly blend age-old hand embroidery techniques like Tilla, Dabka, Schiffli, and Zardozi with modern, relaxed silhouettes. Every garment is crafted in our Lahore ateliers using the finest Pima cotton lawns, pure silks, micro velvets, and sheer tissue organzas.

We believe fashion should feel lightweight, sophisticated, and enduring. Discover timeless Pakistani fashion designed to make every moment memorable.`,
    lastUpdated: '2026-07-01'
  },
  {
    id: 'cms-shipping',
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    content: `### Domestic Shipping (Pakistan)
- **Standard Delivery:** 3 - 5 Working Days.
- **Express Courier Partners:** TCS, Leopard Courier, and M&P.
- **Delivery Charges:** Flat PKR 250. Free Delivery on orders over PKR 10,000.
- **Cash on Delivery (COD):** Available for all cities across Pakistan.

### International Shipping
We ship worldwide via DHL Express. International orders usually arrive in 4 - 7 business days. Custom duties and local taxes (if applicable) are borne by the customer.`,
    lastUpdated: '2026-07-01'
  },
  {
    id: 'cms-returns',
    slug: 'refund-policy',
    title: 'Exchanges & Refund Policy',
    content: `### 14-Day Easy Exchange Policy
We take immense pride in our quality control. However, if you receive a damaged product or require a different size, you may request an exchange within 14 days of delivery.

- Items must be unworn, unwashed, with original tags intact.
- Customized stitched garments are non-returnable unless defective.
- To initiate an exchange, contact us via WhatsApp at +92 300 1234567 or email care@sasaofficial.com.`,
    lastUpdated: '2026-07-01'
  },
  {
    id: 'cms-faq',
    slug: 'faqs',
    title: 'Frequently Asked Questions',
    content: `**Q: Do you offer Cash on Delivery (COD)?**
Yes, COD is available for all orders within Pakistan.

**Q: Can I get my unstitched suit custom stitched by SASA?**
Yes! We offer professional custom tailoring. Simply select "Custom Stitching" on the product page and specify your measurement preferences.

**Q: How do I track my order status?**
Visit our dedicated Order Tracking page, enter your Order Number (e.g., SASA-9842) along with your Phone Number or Email to view real-time delivery steps.`,
    lastUpdated: '2026-07-01'
  }
];
