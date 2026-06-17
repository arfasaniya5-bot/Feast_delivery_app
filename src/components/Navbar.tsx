import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { ShoppingCart, LogIn, LogOut, User as UserIcon, ChefHat, ClipboardList, Utensils, Shield } from "lucide-react";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenCart: () => void;
  activeTab: "menu" | "orders" | "admin";
  setActiveTab: (tab: "menu" | "orders" | "admin") => void;
}

export default function Navbar({ onOpenAuth, onOpenCart, activeTab, setActiveTab }: NavbarProps) {
  const { user, logout, getCartCount } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const cartCount = getCartCount();

  const handleLogoutClick = () => {
    logout();
    setShowDropdown(false);
    setActiveTab("menu");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <button
            onClick={() => {
              setActiveTab("menu");
              setShowDropdown(false);
            }}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            id="brand-logo-trigger"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-rose-600 rounded-xl shadow-md shadow-rose-200 group-hover:scale-105 transition-transform duration-200">
              <Utensils className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                Feast
              </span>
              <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                Delivery App
              </span>
            </div>
          </button>

          {/* Core Navigation Items (Desktop) */}
          <nav className="hidden sm:flex items-center gap-2" id="desktop-nav">
            <button
              onClick={() => {
                setActiveTab("menu");
                setShowDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "menu"
                  ? "bg-rose-50 text-rose-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              id="nav-menu"
            >
              <Utensils className="w-4 h-4" />
              Explore Dishes
            </button>

            {user && (
              <button
                onClick={() => {
                  setActiveTab("orders");
                  setShowDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-rose-50 text-rose-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                id="nav-orders"
              >
                <ClipboardList className="w-4 h-4" />
                Track Orders
              </button>
            )}

            {user?.isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setShowDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-amber-50 text-amber-800 border border-amber-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                id="nav-admin"
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                Admin Console
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Interactive Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-150 cursor-pointer"
              aria-label="View Shopping Cart"
              id="header-cart-btn"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Panel */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all cursor-pointer"
                  id="profile-dropdown-trigger"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <span className="block text-xs font-bold text-gray-800 leading-none">
                      {user.name}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold">
                      {user.isAdmin ? "CHEF ADMIN" : "FOODIE CLIENT"}
                    </span>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1 z-50 animate-fadeIn" id="profile-dropdown-content">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Logged in as</p>
                      <p className="text-xs font-bold text-gray-700 truncate">{user.email}</p>
                      {user.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mt-1.5">
                          <Shield className="w-2.5 h-2.5" />
                          Authorized Admin
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("menu");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      Browse Food Menu
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      My Order Deliveries
                    </button>

                    {user.isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab("admin");
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50/50 flex items-center gap-2 border-t border-gray-50 cursor-pointer"
                      >
                        <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-150 cursor-pointer"
                      id="profile-logout-btn"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gray-900 hover:bg-gray-850 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md transition-all duration-150 cursor-pointer"
                id="btn-trigger-login"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Guest Test
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
