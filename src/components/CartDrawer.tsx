import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, MapPin, Phone, CreditCard, ShoppingBag, Plus, Minus, Lock } from "lucide-react";
import { useStore } from "../context/StoreContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: "menu" | "orders" | "admin") => void;
}

export default function CartDrawer({ isOpen, onClose, onOpenAuth, setActiveTab }: CartDrawerProps) {
  const {
    cartItems,
    foodList,
    addToCart,
    removeFromCart,
    getCartTotal,
    getCartCount,
    user,
    placeOrder,
    addToast
  } = useStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto populate email if user is logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      // Mock seed some values for convenient testing in playground!
      setFirstName(user.name.split(" ")[0]);
      setLastName(user.name.split(" ")[1] || "Foodie");
    }
  }, [user]);

  if (!isOpen) return null;

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 2.00 : 0;
  const grandTotal = parseFloat((subtotal + deliveryFee).toFixed(2));

  // Build the list of cart elements
  const cartElements = Object.keys(cartItems).map((itemId) => {
    const food = foodList.find((f) => f.id === itemId);
    const quantity = cartItems[itemId];
    return {
      food,
      quantity,
    };
  }).filter(el => el.food !== undefined) as Array<{ food: any, quantity: number }>;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast("Please login before initiating checkout.", "error");
      onOpenAuth();
      return;
    }

    if (cartElements.length === 0) {
      addToast("Your shopping cart is empty.", "error");
      return;
    }

    if (!firstName || !lastName || !email || !street || !city || !state || !zipCode || !phone) {
      addToast("Please fill in all address and phone details.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const address = {
        firstName,
        lastName,
        email,
        street,
        city,
        state,
        country,
        zipCode,
        phone,
      };

      const res = await placeOrder(address);
      if (res.success && res.session_url) {
        // Redirect browser to complete checkout page
        // Can be real stripe or local mock verification redirect
        window.location.replace(res.session_url);
      }
    } catch (err: any) {
      addToast("Failed to start checkout. Check server console.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Click outside backdrop close indicator */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl border-l border-gray-100 z-10"
        id="cart-drawer-container"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-black tracking-tight text-gray-900">
              Shopping Cart
            </h2>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
              {getCartCount()} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            id="btn-close-cart-drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
          
          {cartElements.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center max-w-xs mx-auto" id="cart-empty-state">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4 animate-bounce">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your basket is empty</h3>
              <p className="mt-1 text-xs text-gray-400 font-medium">
                Add some tasty culinary items from our main menu to place a fast home delivery.
              </p>
              <button
                onClick={() => {
                  onClose();
                  setActiveTab("menu");
                }}
                className="mt-6 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Browse Delicious Dishes
              </button>
            </div>
          ) : (
            /* Non-Empty Cart list & forms */
            <div className="space-y-6">
              {/* Added Culinary Items */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3" id="cart-drawer-item-list">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">My Selected Menu Items</h3>
                {cartElements.map(({ food, quantity }) => (
                  <div
                    key={food.id}
                    className="flex justify-between items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                    id={`cart-drawer-row-${food.id}`}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{food.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">${food.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => removeFromCart(food.id)}
                          className="p-1 text-gray-500 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-[11px] font-black text-gray-700">{quantity}</span>
                        <button
                          onClick={() => addToCart(food.id)}
                          className="p-1 text-gray-500 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-black text-rose-600 w-12 text-right">
                        ${(food.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order total cards */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2.5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Price Summary</h3>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Cart Items Subtotal</span>
                  <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Standard Fast Delivery</span>
                  <span className="font-bold text-gray-800">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 mt-1 flex justify-between items-baseline">
                  <span className="text-xs font-black text-gray-900">Total Bill Amount</span>
                  <span className="text-lg font-black text-rose-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Secure checkout or Address login request */}
              {!user ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/50 text-center">
                  <div className="inline-flex p-2 bg-amber-100 rounded-xl text-amber-800 mb-2.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-800">Secure Guest Checkout Locked</h4>
                  <p className="mt-1 text-[11px] text-gray-500 font-medium leading-relaxed">
                    Log in with a user or demo account to configure your address and process checkout payments securely.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="mt-3.5 w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-bold tracking-wider transition-all"
                  >
                    Quick Sign In / Unlock Demo
                  </button>
                </div>
              ) : (
                /* Dynamic Checkout Form */
                <form onSubmit={handleCheckoutSubmit} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3" id="shipping-address-form">
                  <div className="flex items-center gap-1.5 border-b border-gray-50 pb-2 mb-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Address Details</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Arfa"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-firstname"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Saniya"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-lastname"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Confirmation Email</label>
                    <input
                      type="email"
                      required
                      placeholder="arfa@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                      id="input-address-email"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Home Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Delicious Boulevard"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                      id="input-address-street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="Los Angeles"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-city"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">State / Prov</label>
                      <input
                        type="text"
                        required
                        placeholder="CA"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-state"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Zip Code</label>
                      <input
                        type="text"
                        required
                        placeholder="90001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-zip"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Country</label>
                      <input
                        type="text"
                        required
                        placeholder="United States"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-country"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Mobile Phone Num</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1-555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs focus:outline-none focus:border-rose-500 text-gray-800"
                        id="input-address-phone"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-rose-200 mt-4 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    id="btn-confirm-checkout"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Place Order (${grandTotal.toFixed(2)})
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5 font-medium leading-relaxed">
                    🔒 Payment gateway configured with secure Stripe Checkout encryption.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
