export const ARCHITECTURE_BLUEPRINT = {
  title: 'B2B2C Gated Multi-Tenant Marketplace - Client Architecture',
  version: '2.4.0-Production',
  stack: {
    frontend: 'React 19, TypeScript, Redux Toolkit, Tailwind CSS v4, Motion, Lucide Icons',
    backend: 'Node.js, Express.js REST API with JWT / Magic Link authentication middleware',
    database: 'MongoDB (Mongoose ODM) with Multi-Tenant index segregation',
    architecture: 'Gated Multi-Tenant B2B2C Client Portal with Token Validation & Dynamic Price Tiers'
  },
  scaffoldingCommands: `
# 1. Initialize Frontend (Vite + React + TypeScript)
npm create vite@latest gated-marketplace-client -- --template react-ts
cd gated-marketplace-client

# 2. Install Redux Toolkit and Core UI Dependencies
npm install @reduxjs/toolkit react-redux lucide-react motion canvas-confetti
npm install -D @types/canvas-confetti tailwindcss @tailwindcss/vite

# 3. Configure Tailwind CSS v4 in vite.config.ts and src/index.css
# 4. Initialize Express Backend (for full-stack monorepo or microservices)
npm install express mongoose dotenv cors helmet jsonwebtoken bcryptjs
npm install -D @types/express @types/jsonwebtoken @types/bcryptjs @types/node tsx
`,
  folderStructure: `
gated-marketplace-client/
├── src/
│   ├── api/                     # Axios/Fetch API client layer & error interceptors
│   │   ├── client.ts            # Base API client with Bearer token injection
│   │   ├── authApi.ts           # Magic link validation & session exchange
│   │   ├── storesApi.ts         # Gated tenant fetcher & access requests
│   │   └── ordersApi.ts         # Checkout payload dispatcher
│   ├── components/              # Modular component hierarchy
│   │   ├── auth/                # MagicLinkHandler, PasswordSetup, RoleSelector
│   │   ├── dashboard/           # TenantStoreGrid, AccessRequestModal, TierBadge
│   │   ├── store/               # StoreCatalogView, ProductCard, PriceTierTable
│   │   ├── cart/                # CartDrawer, CartItemRow, VolumeSavingsSummary
│   │   ├── checkout/            # CheckoutModal, POShippingForm, TaxCalculator
│   │   ├── orders/              # OrderTrackingModal, InvoiceGenerator
│   │   ├── layout/              # Header, Footer, ThemeToggle, TenantBreadcrumb
│   │   └── architecture/        # ArchitectureBlueprintViewer, CodeSnippetTab
│   ├── store/                   # Redux Toolkit Global State
│   │   ├── store.ts             # Redux root store & middleware configuration
│   │   └── slices/
│   │       ├── authSlice.ts     # User session, accessibleStores[], magic tokens
│   │       ├── tenantSlice.ts   # Active tenant store context, catalog filters
│   │       ├── cartSlice.ts     # Multi-tenant cart, tier discount calculation
│   │       ├── orderSlice.ts    # Pending order state & live tracking
│   │       └── themeSlice.ts    # Light/Dark mode state synchronization
│   ├── types/                   # Strict TypeScript contracts (User, Store, Product, Order)
│   ├── data/                    # Seed data & architecture blueprints
│   ├── App.tsx                  # Main client routing & view orchestrator
│   ├── index.css                # Custom theme variables & Tailwind imports
│   └── main.tsx                 # Redux Provider & React DOM root
`,
  mongooseSchemas: `
// ==========================================
// 1. User Schema (Multi-Tenant Access Grants)
// ==========================================
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String }, // Populated after magic link setup
  fullName: { type: String, required: true },
  organization: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['B2B_BUYER', 'PROCUREMENT_LEAD', 'ENTERPRISE_VIP', 'ADMIN'], 
    default: 'B2B_BUYER' 
  },
  // CRITICAL: Restricted Multi-Tenant Store Array
  accessibleStores: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Store',
    index: true 
  }],
  magicTokens: [{
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date }
  }],
  creditLimit: { type: Number, default: 50000 },
  taxExemptNumber: { type: String },
  hasCompletedPasswordSetup: { type: Boolean, default: false }
}, { timestamps: true });

// ==========================================
// 2. Store Schema (Tenant Profile & Access Tiers)
// ==========================================
const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String, required: true },
  accessTier: { 
    type: String, 
    enum: ['Standard', 'VIP Gold', 'Enterprise Exclusive', 'Restricted Partner'], 
    default: 'Standard' 
  },
  requiresApproval: { type: Boolean, default: true },
  taxDefaultRate: { type: Number, default: 0.0825 },
  currency: { type: String, default: 'USD' },
  activePromos: [{
    code: String,
    description: String,
    discountPercent: Number
  }]
}, { timestamps: true });

// ==========================================
// 3. Product Schema (Tiered Pricing & MOQ)
// ==========================================
const ProductSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
  moq: { type: Number, default: 1 }, // Minimum Order Quantity
  stock: { type: Number, default: 0 },
  priceTiers: [{
    minQuantity: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
  }],
  taxRate: { type: Number, default: 0.0825 }
}, { timestamps: true });

// ==========================================
// 4. Order Schema (Gated B2B Multi-Store Checkout)
// ==========================================
const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: String,
    name: String,
    quantity: { type: Number, required: true },
    appliedUnitPrice: { type: Number, required: true },
    appliedDiscountPercent: { type: Number, default: 0 },
    itemSubtotal: Number,
    itemTax: Number
  }],
  subtotal: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Processing', 'Shipped', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['PO_INVOICE', 'CORPORATE_CARD', 'WIRE_TRANSFER', 'NET_30'], 
    required: true 
  },
  poNumber: { type: String },
  shippingAddress: {
    recipientName: String,
    company: String,
    addressLine: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, { timestamps: true });
`,
  expressRoutes: `
// =======================================================
// Express REST API Route Blueprint (Controller Outlines)
// =======================================================

// 1. Magic Link Verification & Account Initialization
router.post('/api/auth/verify-magic-token', async (req, res) => {
  const { token, newPassword } = req.body;
  // Look up user with active unexpired magic token
  const user = await User.findOne({ 'magicTokens.token': token });
  if (!user) return res.status(401).json({ message: 'Invalid or expired magic link' });
  
  if (newPassword) {
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.hasCompletedPasswordSetup = true;
  }
  await user.save();
  
  const jwtSessionToken = jwt.sign(
    { userId: user._id, role: user.role, accessibleStores: user.accessibleStores }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  res.json({ token: jwtSessionToken, user });
});

// 2. Fetch Accessible Stores for Current Authenticated Tenant
router.get('/api/stores/accessible', authMiddleware, async (req, res) => {
  // Read accessibleStores array from authenticated user record
  const user = await User.findById(req.user.userId);
  const stores = await Store.find({ _id: { $in: user.accessibleStores } });
  const allStores = await Store.find({});
  
  res.json({ 
    accessibleStores: stores,
    lockedStores: allStores.filter(s => !user.accessibleStores.includes(s._id.toString()))
  });
});

// 3. Dynamic Tiered Product Catalog for Selected Store
router.get('/api/stores/:storeId/products', authMiddleware, async (req, res) => {
  const { storeId } = req.params;
  // Security guard: Ensure tenant is allowed access
  if (!req.user.accessibleStores.includes(storeId)) {
    return res.status(403).json({ message: 'Access denied to this gated store catalog' });
  }
  const products = await Product.find({ storeId });
  res.json(products);
});

// 4. Cart Submission & Pending Order Creation
router.post('/api/checkout', authMiddleware, async (req, res) => {
  const { items, paymentMethod, poNumber, shippingAddress, promoCode } = req.body;
  
  // Validate all items belong to accessible stores
  for (const item of items) {
    if (!req.user.accessibleStores.includes(item.storeId)) {
      return res.status(403).json({ message: \`Unauthorized store item: \${item.name}\` });
    }
  }

  // Calculate authoritative backend totals & price tiers
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  // ... compute tiered volume pricing against MongoDB records
  
  const order = await Order.create({
    orderNumber: 'NX-' + Date.now().toString(36).toUpperCase(),
    userId: req.user.userId,
    items,
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal: subtotal - discountTotal + taxTotal,
    status: 'Pending', // Enforces 'Pending' B2B order workflow
    paymentMethod,
    poNumber,
    shippingAddress
  });

  res.status(201).json({ success: true, order });
});
`
};
