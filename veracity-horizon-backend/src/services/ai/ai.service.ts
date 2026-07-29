import { AuctionMongoRepository } from "../../repositories/auction.repository";

const auctionRepository = new AuctionMongoRepository();

const CATEGORIES = [
  "Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate",
  "Textiles", "Jewelry", "Antiques", "Food & Spices", "Handicrafts",
  "Musical Instruments", "Books & Manuscripts", "Furniture", "Sports & Gear",
  "Home & Living", "Industrial Equipment", "Luxury Goods", "Agriculture & Livestock",
  "Tools & Hardware", "Ceramics & Pottery", "Carpets & Rugs", "Coins & Currency",
  "Watches & Timepieces", "Photography", "Sculptures", "Paintings",
  "Textbooks & Academic", "Outdoor & Adventure", "Health & Wellness",
  "Office Supplies", "Children & Toys", "Cultural Heritage", "Religious Items",
  "Digital Assets",
];

const NAVIGATION_PAGES: { intent: string[]; href: string; label: string; description: string }[] = [
  { intent: ["dashboard", "home", "overview"], href: "/dashboard", label: "Dashboard", description: "View your dashboard overview" },
  { intent: ["market", "browse", "explore", "shop"], href: "/market", label: "Marketplace", description: "Browse all auction items" },
  { intent: ["my auctions", "my items", "listings"], href: "/dashboard/auctions", label: "My Auctions", description: "Manage your auction listings" },
  { intent: ["bids", "bidding", "my bids"], href: "/dashboard/bids", label: "Bid History", description: "View your bidding history" },
  { intent: ["won", "wins", "won auctions"], href: "/dashboard/won-auctions", label: "Won Auctions", description: "Auctions you have won" },
  { intent: ["portfolio", "collection"], href: "/portfolio", label: "Portfolio", description: "Your portfolio collection" },
  { intent: ["profile", "account", "settings"], href: "/dashboard/profile", label: "Profile", description: "Update your profile settings" },
  { intent: ["create", "sell", "new auction"], href: "/market", label: "Create Auction", description: "Go to the marketplace to list a new item" },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function fuzzyMatch(token: string, target: string): boolean {
  if (token === target) return true;
  if (target.includes(token) || token.includes(target)) return true;
  if (token.length >= 3 && target.length >= 3) {
    let t = 0;
    for (let i = 0; i < token.length && t < target.length; i++) {
      if (token[i] === target[t]) t++;
    }
    if (t === target.length) return true;
  }
  return false;
}

function matchCategory(queryTokens: string[]): string | null {
  for (const category of CATEGORIES) {
    const categoryTokens = tokenize(category);
    for (const qt of queryTokens) {
      for (const ct of categoryTokens) {
        if (fuzzyMatch(qt, ct)) return category;
      }
    }
  }
  return null;
}

export async function aiSearch(query: string, category?: string, page = 1, limit = 20) {
  const queryTokens = tokenize(query);
  const matchedCategory = category || matchCategory(queryTokens);

  const filters: Record<string, unknown> = {};

  if (matchedCategory && matchedCategory !== "All") {
    filters.category = matchedCategory;
  }

  const result = await auctionRepository.getAll(page, limit, query, "", matchedCategory || undefined);

  const suggestions = queryTokens
    .filter((token) => token.length >= 3)
    .slice(0, 5)
    .map((token) => ({
      text: token,
      category: matchCategory([token]) || undefined,
    }));

  return {
    success: true,
    data: result.auctions,
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    ai: {
      detectedCategory: matchedCategory || null,
      suggestions,
      originalQuery: query,
    },
  };
}

export async function aiNavigate(intent: string, context?: Record<string, unknown>) {
  const intentTokens = tokenize(intent);

  let bestMatch: { href: string; label: string; description: string; score: number } | null = null;

  for (const page of NAVIGATION_PAGES) {
    let score = 0;
    for (const pageIntent of page.intent) {
      const pageTokens = tokenize(pageIntent);
      for (const it of intentTokens) {
        for (const pt of pageTokens) {
          if (fuzzyMatch(it, pt)) score += 2;
          if (it === pt) score += 3;
        }
      }
    }
    if (score > (bestMatch?.score || 0)) {
      bestMatch = { ...page, score };
    }
  }

  if (!bestMatch || bestMatch.score < 2) {
    return {
      success: false,
      message: "I couldn't find a matching page. Try asking about dashboard, marketplace, bids, won auctions, or profile.",
      suggestions: NAVIGATION_PAGES.map((p) => ({ href: p.href, label: p.label })),
    };
  }

  return {
    success: true,
    data: {
      href: bestMatch.href,
      label: bestMatch.label,
      description: bestMatch.description,
    },
  };
}

export async function aiSuggest() {
  const popularCategories = CATEGORIES.slice(0, 8);
  const quickActions = [
    { label: "Browse Marketplace", href: "/market", icon: "search" },
    { label: "My Bids", href: "/dashboard/bids", icon: "gavel" },
    { label: "Won Auctions", href: "/dashboard/won-auctions", icon: "trophy" },
    { label: "Create Auction", href: "/market", icon: "plus" },
    { label: "Profile", href: "/dashboard/profile", icon: "user" },
  ];

  return {
    success: true,
    data: {
      popularCategories,
      quickActions,
      tips: [
        "Try searching for 'vintage watches' or 'electronics under 5000'",
        "Use natural language like 'show me my won auctions'",
        "Click the AI assistant for navigation help",
      ],
    },
  };
}
