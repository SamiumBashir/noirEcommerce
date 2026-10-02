export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: "MEN" | "WOMEN" | "ACCESSORIES" | "NEW ARRIVALS";
  gender: "Men" | "Women" | "Unisex";
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  stockCount: number;
  colors: ProductColor[];
  sizes: string[];
  description: string;
  details: string[];
  shippingInfo: string;
  careInstructions: string;
  images: string[];
}

export const PRODUCTS: Product[] = [
  // ==================== MEN'S COLLECTION ====================
  {
    id: "noir-motion-jacket",
    slug: "noir-motion-jacket",
    name: "NOIR MOTION JACKET",
    subtitle: "Designed for movement.",
    category: "MEN",
    gender: "Men",
    price: 189,
    originalPrice: 220,
    rating: 4.9,
    reviewCount: 48,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 15,
    colors: [
      {
        name: "Black",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Charcoal",
        hex: "#2B2B2B",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Bone",
        hex: "#E8E4DC",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "An architectural outerwear piece sculpted for uninhibited kinetic freedom. Engineered from technical bonded wool-blend canvas with seam-sealed internal construction, water-repellent finishing, and ergonomic articulation at elbows and shoulders.",
    details: [
      "Technical water-repellent double-weave fabric",
      "Ergonomic raglan articulation for fluid movement",
      "Concealed RiRi dual-direction matte black zippers",
      "Two deep chest slash pockets and interior passport compartment",
      "Custom gunmetal magnetic snaps",
      "Tailored architectural silhouette with dropped back hem"
    ],
    shippingInfo: "Complimentary global express shipping on all orders. Delivered in eco-conscious luxury matte packaging within 2-4 business days.",
    careInstructions: "Specialist dry clean only. Cool iron under cloth if required.",
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "noir-essential-jacket",
    slug: "noir-essential-jacket",
    name: "Noir Essential Jacket",
    subtitle: "Tailored architectural outerwear.",
    category: "MEN",
    gender: "Men",
    price: 245,
    originalPrice: 280,
    rating: 5.0,
    reviewCount: 32,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    colors: [
      {
        name: "Pitch Black",
        hex: "#0A0A0A",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Shadow Grey",
        hex: "#3D3D3D",
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "The cornerstone of the NOIR outerwear canon. A minimalist trench hybrid featuring structured shoulders, high stand storm collar, and hidden storm flap closure.",
    details: [
      "Structured heavyweight gabardine weave",
      "Fully lined in breathable cupro satin",
      "Concealed horn button placket",
      "Deep angular welt pockets",
      "Handcrafted in Portugal"
    ],
    shippingInfo: "Complimentary global express shipping. 30-day effortless returns.",
    careInstructions: "Dry clean only.",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "shadow-oversized-tee",
    slug: "shadow-oversized-tee",
    name: "Shadow Oversized Tee",
    subtitle: "Heavyweight 320 GSM combed cotton.",
    category: "MEN",
    gender: "Unisex",
    price: 85,
    rating: 4.8,
    reviewCount: 94,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 42,
    colors: [
      {
        name: "Washed Black",
        hex: "#1E1E1E",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Raw Bone",
        hex: "#EFECE6",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Form, proportion, and texture calibrated to perfection. Cut from custom milled 320 GSM combed jersey with a dry hand feel, relaxed boxy drape, and reinforced ribbed collar.",
    details: [
      "100% Organic high-density combed cotton (320 GSM)",
      "Boxy drop-shoulder cut with elongated sleeves",
      "Vintage silicon wash treatment for subtle faded depth",
      "Blind hem stitch finish"
    ],
    shippingInfo: "Ships within 24 hours. Free global shipping on orders over $150.",
    careInstructions: "Machine wash cold inside out, hang dry.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "motion-cargo",
    slug: "motion-cargo",
    name: "Motion Cargo",
    subtitle: "Ergonomic pleat utilitarian pant.",
    category: "MEN",
    gender: "Men",
    price: 165,
    originalPrice: 195,
    rating: 4.9,
    reviewCount: 38,
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    stockCount: 18,
    colors: [
      {
        name: "Noir Black",
        hex: "#121212",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Muted Olive",
        hex: "#3E4338",
        image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["28", "30", "32", "34", "36"],
    description: "Utilitarian technical elegance. Dual front knife pleats taper into articulated knees with flush concealed cargo pockets and adjustable bungee cinch ankles.",
    details: [
      "Durable stretch-ripstop nylon blend with Teflon coating",
      "Magnetic flap cargo compartments with gusseted depth",
      "Elasticated waistband with built-in webbing belt",
      "Drawcord adjustable cuffs for versatile silhouette styling"
    ],
    shippingInfo: "Complimentary express courier shipping.",
    careInstructions: "Cold delicate cycle. Do not tumble dry.",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "eclipse-hoodie",
    slug: "eclipse-hoodie",
    name: "Eclipse Hoodie",
    subtitle: "Double-layered 480 GSM French Terry.",
    category: "MEN",
    gender: "Unisex",
    price: 145,
    rating: 4.9,
    reviewCount: 67,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 25,
    colors: [
      {
        name: "Onyx",
        hex: "#0F0F0F",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Alabaster",
        hex: "#F2EFE9",
        image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "An uncompromising heavyweight pullover sculpted with crossover hood geometry, dropped armholes, and seamless Kangaroo pouch integrated into lateral side seams.",
    details: [
      "480 GSM Loopback organic cotton French Terry",
      "Double-layered substantial structured hood",
      "No drawstrings for a clean, sculptural aesthetic",
      "Heavyweight 2x2 ribbing at hem and cuffs"
    ],
    shippingInfo: "Dispatched from atelier within 24 hours.",
    careInstructions: "Wash cold, flat dry.",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "minimalist-cashmere-crewneck",
    slug: "minimalist-cashmere-crewneck",
    name: "Minimalist Cashmere Crewneck",
    subtitle: "Grade-A 100% Mongolian Cashmere.",
    category: "MEN",
    gender: "Men",
    price: 240,
    originalPrice: 280,
    rating: 4.9,
    reviewCount: 42,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 16,
    colors: [
      {
        name: "Charcoal Melange",
        hex: "#2B2B2B",
        image: "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Raw Black",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "An understated luxury essential woven from 12-gauge 2-ply Mongolian cashmere. Ultra-soft tactile hand feel with seamless saddle shoulder construction and delicate rib micro-trimming.",
    details: [
      "100% Pure Grade-A Mongolian Cashmere",
      "Seamless fully fashioned circular knit technique",
      "Thermal regulating natural loft fiber",
      "Tapered wrist cuffs with architectural fit"
    ],
    shippingInfo: "Complimentary insured express delivery with cedar storage pouch.",
    careInstructions: "Hand wash cold with cashmere wool wash or dry clean.",
    images: [
      "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "selvedge-raw-trouser",
    slug: "selvedge-raw-trouser",
    name: "Japanese Selvedge Denim Trouser",
    subtitle: "14oz Kuroki Mills shuttle-loom denim.",
    category: "MEN",
    gender: "Men",
    price: 195,
    rating: 4.8,
    reviewCount: 29,
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 14,
    colors: [
      {
        name: "Raw Indigo",
        hex: "#182232",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Jet Black",
        hex: "#0D0D0D",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["28", "30", "32", "34", "36"],
    description: "Woven on vintage Toyoda shuttle looms in Ibara, Japan. Features a clean straight-leg drape, concealed button placket with matte black oxidized buttons, and traditional pink selvedge ID line.",
    details: [
      "14oz Unwashed raw ring-spun cotton selvedge denim",
      "Traditional shuttle-loom selvedge outseam binding",
      "Clean slanted front trouser pockets for sharp silhouette",
      "Hidden debossed full-grain leather waist patch"
    ],
    shippingInfo: "Complimentary global shipping. Shipped in rigid atelier cylinder.",
    careInstructions: "Wear raw for 6 months before first cold soak. Hang dry.",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "subversion-wool-blazer",
    slug: "subversion-wool-blazer",
    name: "Subversion Wool Blazer",
    subtitle: "Deconstructed architectural tailoring.",
    category: "MEN",
    gender: "Men",
    price: 340,
    originalPrice: 390,
    rating: 5.0,
    reviewCount: 18,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 9,
    colors: [
      {
        name: "Pitch Black",
        hex: "#0C0C0C",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Slate Melange",
        hex: "#3A3D40",
        image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "An unstructured tailoring masterclass. Italian super 120s virgin wool crafted with soft floating canvas, unpadded natural shoulders, and subtle raw-edge piping across the peak lapel.",
    details: [
      "100% Italian Super 120s virgin tropical wool",
      "Unpadded relaxed architectural shoulder line",
      "Single horn button closure with concealed storm tab",
      "Dual interior jet pockets and ticket compartment"
    ],
    shippingInfo: "Handcrafted in Milan. Complimentary global express courier delivery.",
    careInstructions: "Specialist dry clean only.",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "tactical-canvas-overshirt",
    slug: "tactical-canvas-overshirt",
    name: "Tactical Canvas Overshirt",
    subtitle: "Japanese 340 GSM compact cotton twill.",
    category: "MEN",
    gender: "Men",
    price: 170,
    rating: 4.9,
    reviewCount: 35,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 22,
    colors: [
      {
        name: "Muted Olive",
        hex: "#3E4338",
        image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Washed Black",
        hex: "#1B1B1B",
        image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Engineered as an all-season mid-layer. High-density dry Japanese cotton twill featuring dual bellow chest pockets, concealed RiRi gunmetal zipper, and spread storm collar.",
    details: [
      "340 GSM 100% compact Japanese cotton canvas",
      "Two-way heavy duty gunmetal zipper closure",
      "Gusseted bellow chest pockets with magnetic closures",
      "Relaxed boxy cut with straight hem and side slits"
    ],
    shippingInfo: "Dispatched within 24 hours.",
    careInstructions: "Machine wash cold delicate. Line dry in shade.",
    images: [
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "atelier-lugged-derby",
    slug: "atelier-lugged-derby",
    name: "Atelier Lugged Derby",
    subtitle: "Full-grain Tuscan calfskin with Vibram sole.",
    category: "MEN",
    gender: "Men",
    price: 320,
    originalPrice: 375,
    rating: 4.9,
    reviewCount: 24,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 11,
    colors: [
      {
        name: "Polished Black",
        hex: "#0A0A0A",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description: "An architectural interpretation of the classic blucher. Hand-buffed vegetable-tanned Italian calfskin welted to a lightweight Goodyear Vibram commando lug sole.",
    details: [
      "100% Full-grain Tuscan calf leather upper",
      "360-degree Goodyear storm welt construction",
      "Custom Italian Vibram lightweight lugged rubber outsole",
      "Calf leather lining with shock-absorbing cork footbed filler"
    ],
    shippingInfo: "Includes custom wooden shoe trees and velvet dust bags.",
    careInstructions: "Buff with natural beeswax polish.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop"
    ]
  },

  // ==================== WOMEN'S COLLECTION ====================
  {
    id: "sculptural-wool-coat",
    slug: "sculptural-wool-coat",
    name: "Sculptural Wool Coat",
    subtitle: "Virgin wool double-faced overcoat.",
    category: "WOMEN",
    gender: "Women",
    price: 380,
    originalPrice: 440,
    rating: 5.0,
    reviewCount: 22,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 6,
    colors: [
      {
        name: "Monochrome Black",
        hex: "#141414",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Oatmeal Melange",
        hex: "#D6CFC4",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "A statement silhouette crafted in unlined double-faced virgin wool. Features clean raw-edge seams, dramatic shawl lapels, and a removable self-tie sash.",
    details: [
      "100% Double-faced Italian virgin wool",
      "Hand-finished split seams throughout",
      "Deep kimono sleeves for easy layering over knitwear",
      "Calf-grazing midi length"
    ],
    shippingInfo: "Complimentary insured express courier shipping.",
    careInstructions: "Specialist dry clean only.",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "pleated-kinetic-trouser",
    slug: "pleated-kinetic-trouser",
    name: "Pleated Kinetic Trouser",
    subtitle: "Wide-leg fluid silhouette.",
    category: "WOMEN",
    gender: "Women",
    price: 175,
    rating: 4.8,
    reviewCount: 19,
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 12,
    colors: [
      {
        name: "Midnight",
        hex: "#101016",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Flowing elegance engineered with deep asymmetric pleating that sweeps gracefully with every stride. Tailored high-rise waist with fluid wide leg pooling.",
    details: [
      "Viscose and wool crepe blend with liquid drape",
      "High-rise structured waistband with extended tab",
      "Inverted front pleats and back welt pockets",
      "Full break hem"
    ],
    shippingInfo: "Standard 2-3 business day delivery.",
    careInstructions: "Dry clean.",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "liquid-crepe-column-dress",
    slug: "liquid-crepe-column-dress",
    name: "Liquid Crepe Column Dress",
    subtitle: "Architectural bias-cut column silhouette.",
    category: "WOMEN",
    gender: "Women",
    price: 295,
    originalPrice: 340,
    rating: 5.0,
    reviewCount: 37,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    colors: [
      {
        name: "Noir Black",
        hex: "#0E0E0E",
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Ivory Cream",
        hex: "#F4EFE6",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "An architectural masterpiece cut on the bias in Japanese heavy triacetate matte crepe. Sculpted high boat neckline that balances a striking open cowl back, cascading down to an ankle-skimming fluid column.",
    details: [
      "Japanese matte triacetate heavy crepe",
      "True bias-cut construction for uninhibited fluid movement",
      "Sculptural plunging cowl back with delicate stabilizing bridge",
      "Invisible side zip closure and concealed walking slit"
    ],
    shippingInfo: "Delivered in garment bag with bespoke hanger.",
    careInstructions: "Dry clean only. Steam delicately on reverse.",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "tailored-hourglass-blazer",
    slug: "tailored-hourglass-blazer",
    name: "Tailored Hourglass Blazer",
    subtitle: "Sculptural cinched-waist virgin wool jacket.",
    category: "WOMEN",
    gender: "Women",
    price: 360,
    originalPrice: 420,
    rating: 4.9,
    reviewCount: 26,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 10,
    colors: [
      {
        name: "Charcoal Noir",
        hex: "#171717",
        image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Camel Melange",
        hex: "#A48B71",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Sharp architectural proportions inspired by brutalist geometry. Sculpted pagoda shoulders taper dramatically to a defined cinched waist, releasing into a modern flared peplum hip.",
    details: [
      "100% Fine Italian virgin wool twill",
      "Structured internal floating canvas chest piece",
      "Sleek notch lapels with angled double-welt flap pockets",
      "Handmade dark horn statement buttons"
    ],
    shippingInfo: "Complimentary worldwide express shipping.",
    careInstructions: "Specialist dry clean only.",
    images: [
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "cocoon-ribbed-turtleneck",
    slug: "cocoon-ribbed-turtleneck",
    name: "Cocoon Ribbed Turtleneck",
    subtitle: "Chunky 5-gauge Mongolian cashmere knit.",
    category: "WOMEN",
    gender: "Women",
    price: 275,
    rating: 4.9,
    reviewCount: 41,
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 14,
    colors: [
      {
        name: "Oatmeal",
        hex: "#D8D2C5",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Soft Onyx",
        hex: "#181818",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "An enveloping cocoon sweater spun in substantial 5-gauge Mongolian cashmere. Features an architectural ribbed foldover funnel neck, dropped shoulders, and elongated split cuffs.",
    details: [
      "100% Pure Mongolian Cashmere (5-Gauge Chunky Knit)",
      "Sculptural seamless funnel collar",
      "Elongated sleeves with vented cuffs",
      "Subtle curved high-low stepped hem"
    ],
    shippingInfo: "Free shipping. Includes breathable cashmere storage bag.",
    careInstructions: "Gentle cold hand wash or dry clean.",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "asymmetric-knife-pleat-skirt",
    slug: "asymmetric-knife-pleat-skirt",
    name: "Asymmetric Knife Pleat Skirt",
    subtitle: "Fluid high-waist architectural midi skirt.",
    category: "WOMEN",
    gender: "Women",
    price: 195,
    rating: 4.8,
    reviewCount: 19,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 11,
    colors: [
      {
        name: "Midnight Black",
        hex: "#101014",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Engineered in Kyoto, Japan using precision heat-pressed permanent knife pleats. Tailored with a clean bonded high-rise waist that releases into an asymmetric handkerchief sweep.",
    details: [
      "Technical satin-twill memory fabric",
      "Permanent heat-set razor pleating",
      "Asymmetric stepped hemline with kinetic drape",
      "Concealed side seam zip"
    ],
    shippingInfo: "Delivered within 2-4 business days.",
    careInstructions: "Cold gentle wash. Do not iron pleats.",
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "monochrome-storm-trench",
    slug: "monochrome-storm-trench",
    name: "Monochrome Storm Trench",
    subtitle: "Water-repellent double-weave bonded gabardine.",
    category: "WOMEN",
    gender: "Women",
    price: 410,
    originalPrice: 480,
    rating: 5.0,
    reviewCount: 23,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 7,
    colors: [
      {
        name: "Deep Umber",
        hex: "#1C1A18",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Bone Chalk",
        hex: "#ECE8DF",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "An exaggerated oversized trench crafted from water-impermeable bonded cotton gabardine. Minimalist concealed closure with an oversized gun flap, throat latch, and modular removable belt.",
    details: [
      "Heavyweight bonded cotton waterproof gabardine",
      "Full viscose satin lining with interior zip storage",
      "Magnetic storm flap closure at high collar",
      "Deep storm storm-shield back drape"
    ],
    shippingInfo: "Complimentary global courier shipping.",
    careInstructions: "Specialist dry clean only.",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "sculptural-block-chelsea-boot",
    slug: "sculptural-block-chelsea-boot",
    name: "Sculptural Block Chelsea Boot",
    subtitle: "Hand-buffed Italian calfskin with geometric heel.",
    category: "WOMEN",
    gender: "Women",
    price: 345,
    rating: 4.9,
    reviewCount: 31,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 9,
    colors: [
      {
        name: "Gloss Noir",
        hex: "#0E0E0E",
        image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["36", "37", "38", "39", "40", "41"],
    description: "Carved from premium polished Italian calfskin. Features an architectural 60mm block heel, squared chisel toe, and seamless dual elastic gore for instant comfort and bold posture.",
    details: [
      "100% Semi-gloss Italian calf leather upper",
      "Architectural 60mm sculpted stacked heel",
      "Squared modern chisel toe silhouette",
      "Handcrafted in Civitanova Marche, Italy"
    ],
    shippingInfo: "Delivered in rigid commemorative footwear box with cotton dust wraps.",
    careInstructions: "Wipe with soft damp cloth and nourish with neutral cream.",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop"
    ]
  },

  // ==================== ACCESSORIES COLLECTION ====================
  {
    id: "monolith-leather-tote",
    slug: "monolith-leather-tote",
    name: "Monolith Leather Tote",
    subtitle: "Full-grain calfskin minimal carry.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 295,
    originalPrice: 340,
    rating: 4.9,
    reviewCount: 31,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 9,
    colors: [
      {
        name: "Matte Black",
        hex: "#0E0E0E",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["One Size"],
    description: "Carved from a single hide of supple full-grain Italian calfskin. Features reinforced seamless tubular handles, unlined raw suede interior, and magnetic closure.",
    details: [
      "100% Italian full-grain matte calfskin leather",
      "Hand-painted and burnished edges",
      "Detachable zippered interior pouch with key leash",
      "Dimensions: 42cm x 36cm x 14cm"
    ],
    shippingInfo: "Ships with bespoke dust bag in rigid gift box.",
    careInstructions: "Treat periodically with organic leather balm.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "solitude-acetate-sunglasses",
    slug: "solitude-acetate-sunglasses",
    name: "Solitude Acetate Sunglasses",
    subtitle: "Japanese bevel-cut optical eyewear.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 160,
    rating: 4.7,
    reviewCount: 15,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 14,
    colors: [
      {
        name: "Gloss Black",
        hex: "#181818",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["One Size"],
    description: "Thick 8mm Japanese block acetate sculpted into a sharp rectangular profile with subtle television beveling and 100% UVA/UVB Carl Zeiss dark grey tinted lenses.",
    details: [
      "Custom 8mm cured Japanese acetate frame",
      "German 7-barrel hinges with custom pin rivets",
      "100% UV400 Carl Zeiss CR-39 lenses",
      "Includes hard leather case and microfiber cleaning cloth"
    ],
    shippingInfo: "Complimentary global shipping.",
    careInstructions: "Wipe clean with provided microfiber cloth.",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "monolith-leather-belt",
    slug: "monolith-leather-belt",
    name: "Monolith Leather Belt",
    subtitle: "35mm English bridle leather with gunmetal buckle.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 95,
    rating: 4.8,
    reviewCount: 52,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 28,
    colors: [
      {
        name: "Matte Black",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Saddle Tan",
        hex: "#6E482D",
        image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["85", "90", "95", "100"],
    description: "Forged for a lifetime of wear. 4mm thick English bridle leather cut to 35mm width, hand-burnished with natural carnauba wax, and finished with a custom solid brass buckle in matte gunmetal PVD.",
    details: [
      "English vegetable-tanned 4mm bridle leather",
      "Solid brass buckle with matte dark PVD electroplating",
      "Hand-beveled and edge-painted borders",
      "Debossed NOIR atelier coordinate branding"
    ],
    shippingInfo: "Delivered in linen pouch with brass serial tag.",
    careInstructions: "Nourish twice yearly with leather conditioner.",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "orbital-sterling-silver-cuff",
    slug: "orbital-sterling-silver-cuff",
    name: "Orbital Sterling Silver Cuff",
    subtitle: "Solid 925 silver brutalist hand-sculpted bracelet.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 185,
    rating: 5.0,
    reviewCount: 28,
    isNew: false,
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    colors: [
      {
        name: "Silver",
        hex: "#D1D5DB",
        image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["S/M", "M/L"],
    description: "Cast in solid 925 sterling silver with a raw, brutalist architectural cross-section. Features hand-hammered faceted exterior edges juxtaposed with a mirror-polished comfort interior.",
    details: [
      "Solid 925 Sterling Silver (approx. 48 grams)",
      "Hand-textured satin brushed exterior finish",
      "Ergonomic oval silhouette for wrist stability",
      "Hallmarked with official assay office stamp and NOIR insignia"
    ],
    shippingInfo: "Complimentary express courier shipping with jewelers velvet box.",
    careInstructions: "Wipe gently with silver polishing cloth.",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "kinetic-modular-sling",
    slug: "kinetic-modular-sling",
    name: "Kinetic Modular Sling",
    subtitle: "Waterproof Cordura 500D with Fidlock V-buckle.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 155,
    rating: 4.9,
    reviewCount: 39,
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 17,
    colors: [
      {
        name: "Stealth Black",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["One Size"],
    description: "Compact technical utility bag engineered for urban commutes. Mil-spec Cordura 500D waterproof nylon with magnetic German Fidlock buckle and customizable modular exterior webbing.",
    details: [
      "Waterproof 500D Ballistic Cordura nylon",
      "German magnetic Fidlock V-buckle for instant release",
      "YKK Aquaguard waterproof zippers throughout",
      "Padded air-mesh back panel with hidden passport sleeve"
    ],
    shippingInfo: "Fast 2-day delivery.",
    careInstructions: "Wipe with damp cloth.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "artisan-card-sleeve",
    slug: "artisan-card-sleeve",
    name: "Artisan Bifold Card Sleeve",
    subtitle: "Ultra-slim French Chèvre goat leather cardholder.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 80,
    rating: 4.7,
    reviewCount: 64,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 35,
    colors: [
      {
        name: "Noir",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Raw Taupe",
        hex: "#928A81",
        image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["One Size"],
    description: "Ultra-compact pocket carry crafted from luxurious French Chèvre leather known for its natural pebble grain and scratch resistance. Hand-sewn with waxed French linen thread.",
    details: [
      "French mineral-tanned Chèvre goat leather",
      "Six precision card slots and central cash compartment",
      "Hand-burnished hot-iron creased edges",
      "Integrated military-grade RFID protective lining"
    ],
    shippingInfo: "Delivered in embossed presentation box.",
    careInstructions: "Keep away from prolonged heat and water.",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "fringed-cashmere-wrap",
    slug: "fringed-cashmere-wrap",
    name: "Fringed Mongolian Cashmere Wrap",
    subtitle: "200 x 80cm oversized double-face thermal wrap.",
    category: "ACCESSORIES",
    gender: "Unisex",
    price: 140,
    rating: 4.9,
    reviewCount: 45,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 20,
    colors: [
      {
        name: "Charcoal Melange",
        hex: "#2E2E2E",
        image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Camel",
        hex: "#B39268",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["One Size"],
    description: "Exquisite 200cm x 80cm oversized wrap woven in pure Mongolian cashmere with subtle ripple teasel finish. Provides weightless, cocooning warmth with delicate hand-twisted fringe borders.",
    details: [
      "100% Mongolian Cashmere with natural water-ripple finish",
      "Generous 200cm x 80cm dimensions for versatile draped styling",
      "Traditional 8cm twisted fringe hems",
      "Featherweight loft with exceptional insulating properties"
    ],
    shippingInfo: "Complimentary gift boxing included.",
    careInstructions: "Dry clean or gentle hand wash in lukewarm water.",
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1200&auto=format&fit=crop"
    ]
  },

  // ==================== NEW ARRIVALS COLLECTION ====================
  {
    id: "architectural-silk-shirt",
    slug: "architectural-silk-shirt",
    name: "Architectural Silk Shirt",
    subtitle: "Heavyweight 22 momme washed mulberry silk.",
    category: "NEW ARRIVALS",
    gender: "Women",
    price: 210,
    rating: 5.0,
    reviewCount: 12,
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    stockCount: 11,
    colors: [
      {
        name: "Ivory White",
        hex: "#F4F1EA",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Noir",
        hex: "#101010",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Effortless fluid drape engineered from premium 22 momme sandwashed mulberry silk. Concealed mother-of-pearl button placket with relaxed French cuffs.",
    details: [
      "100% Mulberry silk (sandwashed for matte peachskin touch)",
      "Mother-of-pearl buttons under hidden fly front",
      "Elongated split side seams with curved hem",
      "Convertible collar can be worn spread or closed high"
    ],
    shippingInfo: "Ships immediately.",
    careInstructions: "Dry clean or gentle hand wash cold with silk detergent.",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "reversible-shearling-vest",
    slug: "reversible-shearling-vest",
    name: "Reversible Shearling Vest",
    subtitle: "Spanish merino shearling with matte technical shell.",
    category: "NEW ARRIVALS",
    gender: "Unisex",
    price: 460,
    originalPrice: 520,
    rating: 5.0,
    reviewCount: 16,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 7,
    colors: [
      {
        name: "Onyx",
        hex: "#141414",
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Natural Cream",
        hex: "#EBE5D8",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Two distinct expressions of minimalist luxury. Genuine dense Spanish curly merino shearling reverses completely to a water-resistant technical micro-ripstop shell with deep magnetic kangaroo pockets.",
    details: [
      "100% Spanish Entrefino curly merino shearling",
      "Reverses to technical matte ripstop water-resistant nylon",
      "Two-way heavy duty polished Raccagni metal zipper",
      "High stand wind-shield collar with dual leather snap tabs"
    ],
    shippingInfo: "Handcrafted to order. Complimentary express courier dispatch.",
    careInstructions: "Specialist fur & leather dry cleaner only.",
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "kinetic-sock-runner",
    slug: "kinetic-sock-runner",
    name: "Kinetic Sock Runner",
    subtitle: "Engineered 3D rib-knit high-top sneakers.",
    category: "NEW ARRIVALS",
    gender: "Unisex",
    price: 310,
    rating: 4.8,
    reviewCount: 22,
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 15,
    colors: [
      {
        name: "Noir Monochrome",
        hex: "#111111",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Chalk White",
        hex: "#EDEAE3",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description: "Avant-garde kinetic footwear. Knitted in one continuous piece of memory stretch rib-knit yarn that molds to the foot, set upon a segmented geometric sculpted EVA outsole with carbon-shank arch support.",
    details: [
      "Seamless 3D engineered memory-stretch yarn upper",
      "Sculptural segmented shock-absorbing EVA sole unit",
      "Torsional carbon-composite midfoot stability plate",
      "Ortholite moisture-wicking ergonomic footbed"
    ],
    shippingInfo: "Shipped with custom travel dust bags.",
    careInstructions: "Spot clean knit with mild sneaker cleaner.",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "modular-down-storm-parka",
    slug: "modular-down-storm-parka",
    name: "Modular Down Storm Parka",
    subtitle: "800-fill goose down 3-in-1 waterproof technical coat.",
    category: "NEW ARRIVALS",
    gender: "Men",
    price: 490,
    originalPrice: 560,
    rating: 5.0,
    reviewCount: 14,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    colors: [
      {
        name: "Jet Noir",
        hex: "#0B0B0B",
        image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1200&auto=format&fit=crop"
      },
      {
        name: "Arctic Stone",
        hex: "#CFCBC4",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "The apex of extreme-weather luxury tailoring. A 3-layer laminated waterproof, windproof Japanese shell encasing an RDS-certified 800-fill power grey goose down modular liner that can be detached and worn independently.",
    details: [
      "3-Layer laminated waterproof Japanese technical shell (20,000mm rating)",
      "RDS Certified 800-fill power European grey goose down",
      "Concealed magnetic storm placket over waterproof two-way zipper",
      "Interior backpack carry straps for transitional indoor transit"
    ],
    shippingInfo: "Complimentary insured worldwide courier shipping.",
    careInstructions: "Specialist down cleaner only.",
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
    ]
  }
];

export const CATEGORIES = [
  {
    name: "MEN",
    slug: "men",
    headline: "Structured Precision",
    description: "Engineered silhouettes tailored for modern movement, architectural outerwear, and artisanal footwear.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    itemCount: "10 Pieces"
  },
  {
    name: "WOMEN",
    slug: "women",
    headline: "Fluid Sculptures",
    description: "Flowing architectural drapery crafted in tactile virgin wools, bias-cut crepe, and Mongolian cashmere.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    itemCount: "8 Pieces"
  },
  {
    name: "ACCESSORIES",
    slug: "accessories",
    headline: "Tactile Monoliths",
    description: "Full-grain calfskin leather carry, Japanese block acetate eyewear, and hand-forged 925 silver jewelry.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
    itemCount: "7 Pieces"
  },
  {
    name: "NEW ARRIVALS",
    slug: "new-arrivals",
    headline: "The New Standard",
    description: "Limited edition experimental fabrications, Spanish shearling vests, and modular storm parkas.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop",
    itemCount: "4 Pieces"
  }
];

export interface LookbookItem {
  id: string;
  act: string;
  title: string;
  subtitle: string;
  location: string;
  image: string;
  aspect: "tall" | "wide" | "square";
  caption: string;
  garmentSlugs: string[];
}

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: "look-01",
    act: "ACT 01",
    title: "THE SILENT STRIDE",
    subtitle: "Autumn / Winter Monologue",
    location: "Tokyo • 35.6895° N",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
    aspect: "tall",
    caption: "NOIR Motion Jacket paired with Pleated Kinetic Trousers.",
    garmentSlugs: ["noir-motion-jacket", "pleated-kinetic-trouser"],
  },
  {
    id: "look-02",
    act: "ACT 02",
    title: "MONOLITHIC SHADOW",
    subtitle: "Studio Reflection",
    location: "Berlin • 52.5069° N",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    aspect: "wide",
    caption: "Architectural Silk Shirt in Matte Noir.",
    garmentSlugs: ["architectural-silk-shirt", "monochrome-storm-trench"],
  },
  {
    id: "look-03",
    act: "ACT 03",
    title: "PURE FORM",
    subtitle: "Tokyo Brutalist Set",
    location: "Paris • 48.8643° N",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    aspect: "tall",
    caption: "Sculptural Virgin Wool Coat in Oatmeal Melange.",
    garmentSlugs: ["sculptural-wool-coat", "atelier-lugged-derby"],
  },
  {
    id: "look-04",
    act: "ACT 04",
    title: "KINETIC TENSION",
    subtitle: "Berlin Gallery Series",
    location: "Reykjavik • 64.1466° N",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    aspect: "square",
    caption: "Subversion Wool Blazer and Monolith Leather Carry.",
    garmentSlugs: ["subversion-wool-blazer", "monolith-leather-tote"],
  }
];
