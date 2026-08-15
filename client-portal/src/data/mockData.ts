import { Store, Product, User, StoreWelcomeCredential } from '../types';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store_verdant_agritech',
    name: 'Verdant Commercial AgTech Systems',
    slug: 'verdant-agritech',
    category: 'IoT Sensors & Controlled Environment Ag',
    description: 'Hyperspectral soil probes, automated hydroponic nutrient dosers, and commercial multi-spectrum LED grow arrays.',
    logoUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&auto=format&fit=crop&q=80',
    accessTier: 'Standard',
    requiresApproval: false,
    taxDefaultRate: 0.07,
    currency: 'USD',
    contactEmail: 'agri-support@verdant-farms.net',
    slaGuarantee: 'Standard 48-hour commercial freight',
    activePromos: [
      { code: 'GROWBULK', description: 'Wholesale pallet discount on IoT sensors', discountPercent: 12 }
    ],
    totalProductsCount: 6
  },
  {
    id: 'store_lumina_photonics',
    name: 'Lumina Optics & Photonics Hub',
    slug: 'lumina-optics',
    category: 'Optical & Semiconductor Labware',
    description: 'Military-grade infrared optics, spectral calibration filters, beam splitters, and custom laser assembly kits.',
    logoUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&auto=format&fit=crop&q=80',
    accessTier: 'VIP Gold',
    requiresApproval: true,
    taxDefaultRate: 0.075,
    currency: 'USD',
    contactEmail: 'orders@lumina-photonics.io',
    slaGuarantee: 'Cleanroom ISO Class 5 packaging standard',
    activePromos: [
      { code: 'PHOTON10', description: 'Volume rebate on achromatic doublet lenses', discountPercent: 10 }
    ],
    totalProductsCount: 6
  },
];

export const INITIAL_PRODUCTS: Product[] = [

  // Lumina Optics & Photonics Hub Products
  {
    id: 'prod_lumina_01',
    storeId: 'store_lumina_photonics',
    storeName: 'Lumina Optics & Photonics Hub',
    sku: 'LUM-SPEC-LASER-980',
    name: 'Lumina 980nm High-Stability Diode Laser Module (10W)',
    description: 'Thermoelectrically cooled, fiber-coupled laser source engineered for Raman spectroscopy, bio-imaging, and laser marking applications.',
    category: 'Laser Sources',
    basePrice: 3450.00,
    moq: 1,
    stock: 14,
    inStock: true,
    leadTimeDays: 4,
    taxRate: 0.075,
    featuredOffer: 'Free precision SMA-905 collimator with purchase',
    priceTiers: [
      { minQuantity: 1, discountPercentage: 0, unitPrice: 3450.00 },
      { minQuantity: 3, discountPercentage: 12, unitPrice: 3036.00 },
      { minQuantity: 8, discountPercentage: 20, unitPrice: 2760.00 }
    ],
    specifications: {
      'Wavelength': '980 ± 5 nm',
      'Output Power': '10.0 Watts Continuous Wave',
      'Fiber Core': '105 µm / 0.22 NA',
      'Cooling': 'Integrated TEC & NTC Thermistor'
    },
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80',
    complianceTags: ['FDA CDRH Class IV', 'CE Safe Laser']
  },
  {
    id: 'prod_lumina_02',
    storeId: 'store_lumina_photonics',
    storeName: 'Lumina Optics & Photonics Hub',
    sku: 'LUM-BEAM-SPLIT-50',
    name: 'Broadband Non-Polarizing Cube Beamsplitter Set (25mm)',
    description: 'Fused silica precision cube beamsplitters offering 50/50 transmission/reflection across 400-1100nm spectrum with wavefront distortion < λ/10.',
    category: 'Optical Components',
    basePrice: 420.00,
    moq: 4,
    stock: 80,
    inStock: true,
    leadTimeDays: 1,
    taxRate: 0.075,
    priceTiers: [
      { minQuantity: 1, discountPercentage: 0, unitPrice: 420.00 },
      { minQuantity: 10, discountPercentage: 15, unitPrice: 357.00 },
      { minQuantity: 30, discountPercentage: 25, unitPrice: 315.00 }
    ],
    specifications: {
      'Substrate': 'UV Grade Fused Silica',
      'Surface Flatness': 'λ/10 @ 632.8 nm',
      'AR Coating': 'Ravg < 0.5% per face (400-1100 nm)',
      'Dimensions': '25.4 mm x 25.4 mm cube'
    },
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
    complianceTags: ['MIL-PRF-13830B Compliant']
  },
  {
    id: 'prod_lumina_03',
    storeId: 'store_lumina_photonics',
    storeName: 'Lumina Optics & Photonics Hub',
    sku: 'LUM-INTERFERO-HQ',
    name: 'Digital Fizeau Interferometer Surface Profiler',
    description: 'Sub-nanometer optical surface testing interferometer with high-speed CMOS sensor and automated fringe analysis software.',
    category: 'Metrology Systems',
    basePrice: 18500.00,
    moq: 1,
    stock: 5,
    inStock: true,
    leadTimeDays: 7,
    taxRate: 0.075,
    featuredOffer: 'Institutional Grant & Enterprise Procurement pricing active',
    priceTiers: [
      { minQuantity: 1, discountPercentage: 0, unitPrice: 18500.00 },
      { minQuantity: 2, discountPercentage: 8, unitPrice: 17020.00 }
    ],
    specifications: {
      'Measurement Repeatability': '0.05 nm RMS',
      'Aperture Diameter': '100 mm (4 inch)',
      'Light Source': 'Stabilized 632.8nm He-Ne Laser',
      'Software': 'Direct Phase Shift Analysis Suite'
    },
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    complianceTags: ['NIST Traceable Calibration', 'ISO 9001:2015']
  }
];

export const PRESET_USERS: User[] = [
  {
    id: 'usr_enterprise_sarah',
    username: 'sarah.shopper',
    email: 'sarah.jenkins@gmail.com',
    fullName: 'Sarah Jenkins',
    organization: 'Austin, TX',
    role: 'PRIME_MEMBER',
    accessibleStores: ['store_verdant_agritech', 'store_nexus_robotics', 'store_lumina_photonics', 'store_aerovanguard'],
    hasCompletedPasswordSetup: true,
    isTemporaryPassword: false,
    currentPassword: 'Password123!',
    temporaryPassword: 'Temp#Sarah2026',
    passwordChangedAt: '2026-07-28T14:20:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    mobileNumber: '+1 (512) 890-2144',
    phone: '+1 (512) 890-2144',
    totalSpent: 2450.00, // Gold Tier automatically ($2,000+ spend)
    isVipBlackSubscribed: false,
    address: {
      id: 'addr_1',
      label: 'Home',
      isDefault: true,
      recipientName: 'Sarah Jenkins',
      street: '742 Evergreen Terrace, Apt 4B',
      apartment: 'Apt 4B',
      city: 'Austin',
      state: 'TX',
      zipCode: '78759',
      country: 'United States',
      phone: '+1 (512) 890-2144'
    },
    savedAddresses: [
      {
        id: 'addr_1',
        label: 'Home',
        isDefault: true,
        recipientName: 'Sarah Jenkins',
        street: '742 Evergreen Terrace, Apt 4B',
        apartment: 'Apt 4B',
        city: 'Austin',
        state: 'TX',
        zipCode: '78759',
        country: 'United States',
        phone: '+1 (512) 890-2144'
      },
      {
        id: 'addr_2',
        label: 'Work / Office',
        isDefault: false,
        recipientName: 'Sarah Jenkins',
        street: '1200 Innovation Parkway, Suite 300',
        apartment: 'Suite 300',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'United States',
        phone: '+1 (512) 555-0199'
      }
    ]
  },
  {
    id: 'usr_buyer_marcus',
    username: 'marcus.vance',
    email: 'marcus.vance@yahoo.com',
    fullName: 'Marcus Vance',
    organization: 'Cambridge, MA',
    role: 'VIP_SHOPPER',
    accessibleStores: ['store_verdant_agritech', 'store_nexus_robotics', 'store_lumina_photonics'],
    hasCompletedPasswordSetup: true,
    isTemporaryPassword: false,
    currentPassword: 'Password123!',
    temporaryPassword: 'Temp#Marcus99',
    passwordChangedAt: '2026-08-01T10:15:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    mobileNumber: '+1 (617) 495-8820',
    phone: '+1 (617) 495-8820',
    totalSpent: 850.00, // Silver Tier automatically ($500 - $1,999 spend)
    isVipBlackSubscribed: false,
    address: {
      id: 'addr_bio_1',
      label: 'Home',
      isDefault: true,
      recipientName: 'Marcus Vance',
      street: '450 Kendall Street, Apt 12C',
      apartment: 'Apt 12C',
      city: 'Cambridge',
      state: 'MA',
      zipCode: '02142',
      country: 'United States',
      phone: '+1 (617) 495-8820'
    },
    savedAddresses: [
      {
        id: 'addr_bio_1',
        label: 'Home',
        isDefault: true,
        recipientName: 'Marcus Vance',
        street: '450 Kendall Street, Apt 12C',
        apartment: 'Apt 12C',
        city: 'Cambridge',
        state: 'MA',
        zipCode: '02142',
        country: 'United States',
        phone: '+1 (617) 495-8820'
      }
    ]
  }
];

export const STORE_ISSUED_CREDENTIALS: StoreWelcomeCredential[] = [
  {
    id: 'cred_marcus',
    storeName: 'BioVance Pharma & Verdant Living',
    storeLogo: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&auto=format&fit=crop&q=80',
    recipientName: 'Marcus Vance (VIP Shopper)',
    email: 'marcus.vance@yahoo.com',
    username: 'marcus.vance',
    tempPassword: 'Temp#Marcus99',
    accessibleStores: ['store_biovance_pharma', 'store_verdant_agritech'],
    issuedAt: 'Invited to 2 Stores',
    note: 'Invited to BioVance Health & Verdant Agritech. Access only granted stores upon sign in.'
  },
  {
    id: 'cred_sarah',
    storeName: 'Nexus, Lumina & AeroVanguard Collective',
    storeLogo: 'https://images.unsplash.com/photo-1517976487507-580da3a82388?w=120&auto=format&fit=crop&q=80',
    recipientName: 'Sarah Jenkins (Prime Member)',
    email: 'sarah.jenkins@gmail.com',
    username: 'sarah.shopper',
    tempPassword: 'Temp#Sarah2026',
    accessibleStores: ['store_nexus_robotics', 'store_lumina_photonics', 'store_aerovanguard'],
    issuedAt: 'Invited to 3 Stores',
    note: 'Invited to 3 exclusive stores: Nexus Robotics, Lumina Photonics, and AeroVanguard.'
  },
];

export const DEMO_MAGIC_TOKENS: Record<string, { email: string; organization: string; stores: string[]; role: User['role'] }> = {
  'sarah.shopper': {
    email: 'sarah.jenkins@gmail.com',
    organization: 'Austin, TX',
    stores: ['store_nexus_robotics', 'store_lumina_photonics', 'store_aerovanguard'],
    role: 'PRIME_MEMBER'
  },
  'marcus.vance': {
    email: 'marcus.vance@yahoo.com',
    organization: 'Cambridge, MA',
    stores: ['store_biovance_pharma', 'store_verdant_agritech'],
    role: 'VIP_SHOPPER'
  }
};
