import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FoodGrid from "./components/FoodGrid";
import CartDrawer from "./components/CartDrawer";
import MyOrdersView from "./components/MyOrdersView";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import ToastContainer from "./components/ToastContainer";
import { useStore } from "./context/StoreContext";
import { Clock, Gift, ShieldAlert, Heart, Activity } from "lucide-react";

export default function App() {
  const { user, loading, orders, getCartCount, addToast } = useStore();
  
  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "admin">("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auto route customer to orders overview if checkout has successfully Redirected-back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successParam = params.get("success");
    const orderIdParam = params.get("orderId");

    if (successParam === "true" && orderIdParam) {
      setActiveTab("orders");
      addToast("Order successfully approved and cooking!", "success");
      
      // Clean query parameters from URL elegantly to stop repetitive messages
      window.history.replaceState({}, document.title, "/");
    } else if (successParam === "false") {
      addToast("Checkout failed. Try selecting alternative credit cards.", "error");
      window.history.replaceState({}, document.title, "/");
    }
  }, [addToast]);

  // Route protection - enforce that only admins see admin terminal
  useEffect(() => {
    if (activeTab === "admin" && (!user || !user.isAdmin)) {
      setActiveTab("menu");
      addToast("Access Denied. Admin login privileges required.", "error");
    }
  }, [activeTab, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800" id="app-root-wrapper">
      
      {/* Dynamic Global Notification Toasts */}
      <ToastContainer />

      {/* Primary Header Navigation Bar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // auto scroll smoothly to anchor on menu tab switch
          if (tab === "menu") {
            setTimeout(() => {
              document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }}
      />

      {/* Main Orchestrated View Panels */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "menu" && (
          <div id="panel-browse-menu">
            {/* Display Banner Promotion */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 py-2 px-4 text-center text-xs font-bold text-white flex items-center justify-center gap-2 relative z-15 select-none animate-fadeIn">
              <Gift className="w-4 h-4 text-amber-300" />
              <span>Limited Offer: Save up to 25% on your first order with voucher FEAST25!</span>
            </div>

            {/* Visual Hero & search category rails */}
            <Hero
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            {/* Menu Grid list */}
            <FoodGrid
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>
        )}

        {activeTab === "orders" && (
          <div className="animate-fadeIn" id="panel-track-orders">
            {user ? (
              <MyOrdersView />
            ) : (
              <div className="py-24 text-center max-w-sm mx-auto">
                <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-full mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sign In to Track Orders</h3>
                <p className="text-gray-500 text-sm mt-1 mb-6 leading-relaxed font-medium">
                  We verify order tracking histories using your active, secure email session credentials.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-rose-200 transition-all duration-150"
                  id="btn-login-orders-guard"
                >
                  Unblock Client Profile
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "admin" && user?.isAdmin && (
          <div className="animate-fadeIn" id="panel-admin-console">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Global Interactive Overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
        setActiveTab={setActiveTab}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Brand Copyright Footer */}
      <footer className="bg-white border-t border-gray-150 py-10" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-rose-600">
            <Heart className="w-5 h-5 fill-rose-600 animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
              Baked Fresh with Vibe Coding
            </span>
          </div>
          
          <div className="flex justify-center gap-6 text-gray-400 text-xs font-semibold">
            <button onClick={() => setActiveTab("menu")} className="hover:text-gray-600">Explore Menu</button>
            <button onClick={() => setIsCartOpen(true)} className="hover:text-gray-600">View Basket</button>
            <button onClick={() => {
              if (user) setActiveTab("orders");
              else setIsAuthOpen(true);
            }} className="hover:text-gray-600">Live Track Deliveries</button>
            <button onClick={() => {
              if (user?.isAdmin) setActiveTab("admin");
              else setIsAuthOpen(true);
            }} className="hover:text-gray-600">Admin Console</button>
          </div>

          <div className="text-[10px] text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Feast Food Culinary Inc. All culinary rights reserved. Made for portfolio live demonstrations.
          </div>
        </div>
      </footer>

    </div>
  );
}
