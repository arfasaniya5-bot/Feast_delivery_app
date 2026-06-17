import { motion } from "motion/react";
import { Plus, Minus, SearchX } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Food } from "../types";

interface FoodGridProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export default function FoodGrid({ searchQuery, setSearchQuery, activeCategory, setActiveCategory }: FoodGridProps) {
  const { foodList, cartItems, addToCart, removeFromCart } = useStore();

  // Filter foods by Category and Search query
  const filteredFoods = foodList.filter((food) => {
    const matchesCategory = activeCategory === "All" || food.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      food.name.toLowerCase().includes(query) ||
      food.description.toLowerCase().includes(query) ||
      food.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
  };

  return (
    <section className="py-12 bg-gray-50/50" id="menu-grid-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Our Curated Menu
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
              Currently showing {filteredFoods.length} gourmet {filteredFoods.length === 1 ? "dish" : "dishes"}
            </p>
          </div>

          {(searchQuery || activeCategory !== "All") && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all border border-rose-100 self-start"
              id="btn-clear-filters"
            >
              Reset Search Filter
            </button>
          )}
        </div>

        {/* Empty Search Fallback State */}
        {filteredFoods.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto" id="empty-menu-state">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Dishes Found</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              We couldn't find matches for "{searchQuery || activeCategory}". Try searching something else or reset the filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-5 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-rose-200"
            >
              Browse All Foods
            </button>
          </div>
        ) : (
          /* Food Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="foods-item-grid">
            {filteredFoods.map((food) => {
              const quantityInCart = cartItems[food.id] || 0;

              return (
                <motion.div
                  layout
                  key={food.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group glow-card"
                  id={`food-card-${food.id}`}
                >
                  {/* Food Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-gray-50 bg-cover">
                    <img
                      src={food.image}
                      alt={food.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-white/95 border border-gray-100 rounded-full text-rose-600 shadow-sm backdrop-blur-sm">
                        {food.category}
                      </span>
                    </div>
                  </div>

                  {/* Details Card Block */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 line-clamp-1">
                        {food.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 font-medium line-clamp-2 min-h-[2rem]">
                        {food.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-50 pt-4">
                      {/* Price tag */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block leading-none">PRICE</span>
                        <span className="text-lg font-black text-rose-600">
                          ${food.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Interaction Controls */}
                      {quantityInCart === 0 ? (
                        <button
                          onClick={() => addToCart(food.id)}
                          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer"
                          id={`btn-add-cart-${food.id}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      ) : (
                        <div
                          className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-xl p-1 shadow-inner"
                          id={`qty-controller-${food.id}`}
                        >
                          <button
                            onClick={() => removeFromCart(food.id)}
                            className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            id={`btn-dec-qty-${food.id}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="w-6 text-center text-xs font-black text-rose-800">
                            {quantityInCart}
                          </span>
                          
                          <button
                            onClick={() => addToCart(food.id)}
                            className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            id={`btn-inc-qty-${food.id}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
