import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Food, CartItems, User, Order, OrderAddress } from "../types";

interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

interface StoreContextType {
  foodList: Food[];
  cartItems: CartItems;
  token: string | null;
  user: User | null;
  loading: boolean;
  orders: Order[];
  toasts: ToastMessage[];
  addToast: (text: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  addToCart: (itemId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQty: (itemId: string, qty: number) => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  placeOrder: (address: OrderAddress) => Promise<{ success: boolean; session_url?: string; isMock?: boolean; message?: string }>;
  fetchUserOrders: () => Promise<void>;
  fetchFoods: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [foodList, setFoodList] = useState<Food[]>([]);
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [token, setToken] = useState<string | null>(localStorage.getItem("feast_token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast System
  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Headers helper
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Fetch all foods
  const fetchFoods = async () => {
    try {
      const res = await fetch("/api/food/list");
      const data = await res.json();
      if (data.success) {
        setFoodList(data.data);
      } else {
        addToast(data.message || "Failed to load menu", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error loading food catalog", "error");
    }
  };

  // Fetch logged in user profile
  const fetchUserProfile = async () => {
    if (!token) {
      setUser(null);
      setCartItems({});
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        // Sync cart after user loads
        await fetchCart();
        // Fetch user orders
        await fetchUserOrders();
      } else {
        // Stale token
        logout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/cart/get", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cartData || {});
      }
    } catch (err) {
      console.error("Cart sync load error", err);
    }
  };

  // Fetch user orders
  const fetchUserOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/order/userorders", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // On mount, load food list and then profile if token exists
  useEffect(() => {
    const initialize = async () => {
      await fetchFoods();
      if (token) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, [token]);

  // Add to cart
  const addToCart = async (itemId: string) => {
    // Optimistic Update
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    const food = foodList.find((f) => f.id === itemId);
    addToast(`Added ${food?.name || "item"} to cart!`, "success");

    if (token) {
      try {
        await fetch("/api/cart/add", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ itemId }),
        });
      } catch (err) {
        console.error("Failed to sync cart item with server", err);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId: string) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        next[itemId] -= 1;
        if (next[itemId] <= 0) {
          delete next[itemId];
        }
      }
      return next;
    });

    const food = foodList.find((f) => f.id === itemId);
    addToast(`Removed 1 ${food?.name || "item"} from cart`, "info");

    if (token) {
      try {
        await fetch("/api/cart/remove", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ itemId }),
        });
      } catch (err) {
        console.error("Failed to sync cart subtraction with server", err);
      }
    }
  };

  // Direct quantity update (e.g. from input or specific setter)
  const updateCartItemQty = async (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      if (token) {
        // sync remove
        try {
          await fetch("/api/cart/remove", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ itemId }), // backend updates -1 but we can do custom trigger
          });
        } catch (e) {}
      }
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: qty }));
      // We can sync by adding multiple or custom (typically simple addToCart keeps syncing)
    }
  };

  // Calculate Subtotal
  const getCartTotal = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      const food = foodList.find((f) => f.id === itemId);
      if (food) {
        total += food.price * quantity;
      }
    }
    return parseFloat(total.toFixed(2));
  };

  // Count of items
  const getCartCount = () => {
    let count = 0;
    for (const itemId in cartItems) {
      count += cartItems[itemId];
    }
    return count;
  };

  // Register
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("feast_token", data.token);
        setToken(data.token);
        setUser(data.user);
        addToast(`Welcome ${data.user.name}! Account created.`, "success");
        return { success: true, message: data.message };
      } else {
        addToast(data.message || "Registration failed", "error");
        return { success: false, message: data.message };
      }
    } catch (err) {
      addToast("Server network error on signup", "error");
      return { success: false, message: "Network connection failed" };
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("feast_token", data.token);
        setToken(data.token);
        setUser(data.user);
        addToast(`A warm welcome back, ${data.user.name}!`, "success");
        return { success: true, message: data.message };
      } else {
        addToast(data.message || "Invalid credentials", "error");
        return { success: false, message: data.message };
      }
    } catch (err) {
      addToast("Server network error on login", "error");
      return { success: false, message: "Network connection failed" };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("feast_token");
    setToken(null);
    setUser(null);
    setCartItems({});
    setOrders([]);
    addToast("Logged out successfully. See you soon!", "info");
  };

  // Place Order (Stripe Session Checkout)
  const placeOrder = async (address: OrderAddress) => {
    if (!token) {
      addToast("Please login or sign up to finalize your order.", "error");
      return { success: false, message: "Authentication required" };
    }

    if (getCartCount() === 0) {
      addToast("Your cart is empty. Please add items before checking out.", "error");
      return { success: false, message: "Cart empty" };
    }

    try {
      // Package current items in cart to post to order endpoint
      const listToOrder = Object.keys(cartItems).map((itemId) => {
        const item = foodList.find((f) => f.id === itemId);
        return {
          foodId: itemId,
          name: item?.name || "Gourmet Dish",
          price: item?.price || 0,
          quantity: cartItems[itemId],
          image: item?.image || "",
        };
      });

      const totalAmount = getCartTotal() + 2; // + $2.00 delivery

      const res = await fetch("/api/order/place", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          items: listToOrder,
          amount: totalAmount,
          address,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast("Order created! Redirecting to secure checkout...", "success");
        return {
          success: true,
          session_url: data.session_url,
          isMock: data.isMock,
        };
      } else {
        addToast(data.message || "Checkout creation failed", "error");
        return { success: false, message: data.message };
      }
    } catch (err) {
      addToast("Failed to communicate with billing server", "error");
      return { success: false, message: "Connection error" };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        foodList,
        cartItems,
        token,
        user,
        loading,
        orders,
        toasts,
        addToast,
        removeToast,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        getCartTotal,
        getCartCount,
        login,
        register,
        logout,
        placeOrder,
        fetchUserOrders,
        fetchFoods,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
