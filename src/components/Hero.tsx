import { Search, Flame, Award, Clock } from "lucide-react";
import { Food } from "../types";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

const CATEGORIES = [
  { id: "All", name: "All items", emoji: "🍽️" },
  { id: "Italian", name: "Italian Pizza", emoji: "🍕" },
  { id: "Burgers", name: "Burgers & Grill", emoji: "🍔" },
  { id: "Salads", name: "Salads", emoji: "🥗" },
  { id: "Sides", name: "Snacks & Sides", emoji: "🍟" },
  { id: "Asian", name: "Asian Specialties", emoji: "🍜" },
  { id: "Desserts", name: "Gourmet Desserts", emoji: "🍰" },
];

export default function Hero({ searchQuery, setSearchQuery, activeCategory, setActiveCategory }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50/50 py-12 sm:py-16 border-b border-gray-100" id="hero-section">
      {/* Dynamic Background visual ornaments */}
      <div className="absolute top-1/4 left-5 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Quality Badges */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 border border-rose-100/60 rounded-full shadow-sm text-rose-600 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
          <Flame className="w-3.5 h-3.5 fill-rose-600" />
          The Ultimate Gastronomy Experience
        </div>

        {/* Main Header Display Typography */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.08] max-w-3xl mx-auto" id="hero-heading">
          Gourmet Dishes <br />
          <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
            Delivered Straight to You
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl mx-auto font-medium">
          Fresh, local farm-to-table recipes curated by double-starred chefs, delivered hot and fresh in under 20 minutes.
        </p>

        {/* Search Bar Block */}
        <div className="mt-8 max-w-xl mx-auto relative" id="search-container">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5 text-rose-500" />
          </div>
          <input
            type="text"
            placeholder="Search our delicious double-cheeseburgers, pizzas, roll, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-rose-100/60 focus:border-rose-500 rounded-2xl shadow-xl shadow-rose-100/30 text-gray-900 placeholder-gray-400 text-sm sm:text-base font-medium focus:outline-none focus:ring-0 transition-all"
            id="hero-search-input"
          />
        </div>

        {/* Delivery USP Tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600 font-semibold">
          <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-xl border border-gray-100">
            <Clock className="w-4 h-4 text-rose-500" />
            20-Min Super Fast Delivery
          </span>
          <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-xl border border-gray-100">
            <Award className="w-4 h-4 text-amber-500" />
            Award-Winning Quality
          </span>
        </div>

        {/* Dynamic Category Sliders */}
        <div className="mt-12 sm:mt-16">
          <div className="text-left max-w-7xl mx-auto mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">
              Select Cooking Category
            </h3>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-4 sm:mx-0 snap-x scrollbar-none" id="categories-scroller">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200"
                      : "bg-white border-gray-100 text-gray-600 hover:border-rose-200 hover:text-rose-600 hover:shadow-md"
                  }`}
                  id={`cat-btn-${cat.id}`}
                >
                  <span className="text-lg leading-none">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
