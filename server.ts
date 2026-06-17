import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { dbUsers, dbFoods, dbOrders, User, Food, Order } from "./server/db";

// Make sure process.env.JWT_SECRET has a reliable fallback
const JWT_SECRET = process.env.JWT_SECRET || "feast_flow_delivery_secret_jwt_key_2026_safe_fallback";

// Lazy initialize Stripe only when needed
let stripeInstance: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "MY_STRIPE_SECRET_KEY") {
    console.warn("Stripe key is missing or is set to placeholder. App will run in mock checkout mode.");
    return null;
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripeInstance;
}

const app = express();
const PORT = 3000;

// Enable JSON body parsing down to 50mb (for custom uploads or payloads)
app.use(express.json({ limit: "50mb" }));

// Helper: Seed initial Admin & Customer accounts for easy testing in live preview
function seedAccounts() {
  const users = dbUsers.list();
  
  const existingAdmin = dbUsers.getByEmail("arfasaniya5@gmail.com");
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("adminpassword", salt);
    dbUsers.add({
      id: "user_admin",
      name: "Grand Chef Admin",
      email: "arfasaniya5@gmail.com",
      passwordHash,
      cartData: {},
      isAdmin: true
    });
    console.log("Seeded Admin Account: arfasaniya5@gmail.com / adminpassword");
  }

  const existingCustomer = dbUsers.getByEmail("customer@feast.com");
  if (!existingCustomer) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("customerpassword", salt);
    dbUsers.add({
      id: "user_customer",
      name: "Happy Foodie",
      email: "customer@feast.com",
      passwordHash,
      cartData: {},
      isAdmin: false
    });
    console.log("Seeded Customer Account: customer@feast.com / customerpassword");
  }
}

seedAccounts();

// ==========================================
// MIDDLEWARES
// ==========================================

// Auth middleware to decode JWT
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. Token missing or invalid." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; isAdmin: boolean };
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
};

// ==========================================
// API ENDPOINTS - AUTH
// ==========================================

// Register
app.post("/api/user/register", (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields: Name, Email, Password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = dbUsers.getByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with that email already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: "user_" + Date.now().toString(36),
      name,
      email: normalizedEmail,
      passwordHash,
      cartData: {},
      isAdmin: normalizedEmail === "arfasaniya5@gmail.com"
    };

    dbUsers.add(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
});

// Login
app.post("/api/user/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = dbUsers.getByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Login failed" });
  }
});

// Get user profile
app.get("/api/user/profile", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = dbUsers.getById(req.userId || "");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==========================================
// API ENDPOINTS - FOOD
// ==========================================

// List foods
app.get("/api/food/list", (req: Request, res: Response) => {
  try {
    const list = dbFoods.list();
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch food list" });
  }
});

// Add food (Admin only)
app.post("/api/food/add", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const { name, description, price, category, image } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "Name, price, and category are required." });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: "Price must be a valid number greater than 0." });
    }

    // Default food image fallback
    const foodImage = image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600";

    const newFood: Food = {
      id: "food_" + Date.now().toString(36),
      name,
      description: description || "Gourmet recipe cooked with fresh ingredients.",
      price: numPrice,
      category,
      image: foodImage
    };

    dbFoods.add(newFood);

    res.json({ success: true, message: "Food item added successfully!", data: newFood });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to add food" });
  }
});

// Remove food (Admin only)
app.post("/api/food/remove", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Food ID is required to remove an item." });
    }

    const removed = dbFoods.remove(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }

    res.json({ success: true, message: "Food item successfully removed from menu." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to remove food" });
  }
});

// ==========================================
// API ENDPOINTS - CART
// ==========================================

// Get user cart
app.get("/api/cart/get", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = dbUsers.getById(req.userId || "");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, cartData: user.cartData || {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
});

// Add to cart
app.post("/api/cart/add", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required." });
    }

    const user = dbUsers.getById(req.userId || "");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = { ...(user.cartData || {}) };
    cart[itemId] = (cart[itemId] || 0) + 1;

    dbUsers.update(user.id, { cartData: cart });

    res.json({ success: true, message: "Item added to cart!", cartData: cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
});

// Remove from cart (subtracts 1 quantity, or removes if 0)
app.post("/api/cart/remove", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required." });
    }

    const user = dbUsers.getById(req.userId || "");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = { ...(user.cartData || {}) };
    if (cart[itemId]) {
      cart[itemId] -= 1;
      if (cart[itemId] <= 0) {
        delete cart[itemId];
      }
    }

    dbUsers.update(user.id, { cartData: cart });

    res.json({ success: true, message: "Item updated / removed from cart!", cartData: cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to remove from cart" });
  }
});

// ==========================================
// API ENDPOINTS - ORDERS
// ==========================================

// Create Order & Retrieve Checkout session (Full Stripe flow with local mock-backups)
app.post("/api/order/place", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId || "";

    if (!items || !items.length || !amount || !address) {
      return res.status(400).json({ success: false, message: "Incomplete checkout parameters (items, amount, address details required)." });
    }

    // Prepare food menu items mapping to verify prices
    const foodList = dbFoods.list();
    const verifiedItems = items.map((clientItem: any) => {
      const dbFood = foodList.find((f) => f.id === clientItem.foodId);
      return {
        foodId: clientItem.foodId,
        name: dbFood ? dbFood.name : clientItem.name,
        price: dbFood ? dbFood.price : clientItem.price,
        quantity: clientItem.quantity,
        image: dbFood ? dbFood.image : clientItem.image,
      };
    });

    const newOrder: Order = {
      id: "order_" + Date.now().toString(36),
      userId,
      items: verifiedItems,
      amount,
      address,
      status: "Food Processing",
      payment: false,
      createdAt: new Date().toISOString()
    };

    dbOrders.add(newOrder);

    // Try connecting to real Stripe
    const stripe = getStripe();
    const appUrl = process.env.APP_URL || `http://localhost:3000`;

    if (stripe) {
      // Build session item formats for real stripe checkout
      const lineItems = verifiedItems.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      }));

      // Add delivery fee as line item
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: 200, // $2.00 delivery
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${appUrl}/api/order/verify?success=true&orderId=${newOrder.id}&userId=${userId}`,
        cancel_url: `${appUrl}/api/order/verify?success=false&orderId=${newOrder.id}&userId=${userId}`,
        metadata: {
          orderId: newOrder.id,
          userId
        }
      });

      // Respond with real checkout session URL
      res.json({
        success: true,
        session_url: session.url,
        orderId: newOrder.id,
        isMock: false
      });
    } else {
      // Gracefully fall back to Mock checkout flow to keep developer workflow 100% functional
      console.log(`Fallback mock stripe session url triggered for order: ${newOrder.id}`);
      // Return a path that completes the order locally instantly! The client will intercept this.
      const mockSuccessUrl = `/api/order/verify?success=true&orderId=${newOrder.id}&userId=${userId}&mock=true`;
      res.json({
        success: true,
        session_url: mockSuccessUrl,
        orderId: newOrder.id,
        isMock: true
      });
    }
  } catch (err: any) {
    console.error("Order placing error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to place order" });
  }
});

// Verification Endpoint (Stripe calls success/cancel redirecting here)
// This can be triggered either as GET (redirect or fetch) or post
app.get("/api/order/verify", (req: Request, res: Response) => {
  try {
    const { success, orderId, userId, mock } = req.query;

    const isSuccess = success === "true";
    const userIdentifier = String(userId);
    const id = String(orderId);

    if (isSuccess && id) {
      // Mark physical payment true
      dbOrders.updatePaymentStatus(id, true);

      // Clear the user's cart upon successful transaction
      dbUsers.update(userIdentifier, { cartData: {} });

      // If it is mock or inline, redirect back to orders list
      res.send(`
        <html>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fafafa; color: #111;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="font-size: 50px; margin-bottom: 20px;">🎉</div>
              <h1 style="color: #10b981; font-size: 24px; margin-bottom: 10px;">Payment Successful!</h1>
              <p style="color: #6b7280; font-size: 15px; margin-bottom: 30px;">Your delicious food order has been placed. Chefs are preparing it now!</p>
              <a href="/" style="background: #e11d48; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; display: inline-block;">Track Your Order</a>
            </div>
          </body>
        </html>
      `);
    } else {
      // Delete empty pending failed order to clean up DB
      res.send(`
        <html>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fafafa; color: #111;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="font-size: 50px; margin-bottom: 20px;">⚠️</div>
              <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 10px;">Payment Cancelled</h1>
              <p style="color: #6b7280; font-size: 15px; margin-bottom: 30px;">Your transaction was cancelled or failed. Please try checkout again.</p>
              <a href="/" style="background: #374151; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; display: inline-block;">Return to Cart</a>
            </div>
          </body>
        </html>
      `);
    }
  } catch (err: any) {
    res.status(500).send("Verification processing error");
  }
});

// JSON Post variant of verify for client convenience
app.post("/api/order/verify-checkout", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { success, orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID matches missing reference." });
    }

    if (success) {
      dbOrders.updatePaymentStatus(orderId, true);
      dbUsers.update(req.userId || "", { cartData: {} });
      res.json({ success: true, message: "Order paid successfully & cart flushed." });
    } else {
      res.json({ success: false, message: "Order marked cancelled." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Internal order confirmation error." });
  }
});

// User orders list
app.get("/api/order/userorders", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = dbOrders.getByUserId(req.userId || "");
    // sort orders by newly created date descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to load user orders" });
  }
});

// All orders list (Admin only)
app.get("/api/order/list", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }
    const orders = dbOrders.list();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// Update order status (Admin only)
app.post("/api/order/status", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Missing Order ID or Status value." });
    }

    const validStatuses = ["Food Processing", "Preparing", "Out For Delivery", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const updated = dbOrders.updateStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, message: "Order status updated successfully!", data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

// ==========================================
// STATIC FILES & VITE HMR INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    // Let Vite load its config (vite.config.js) to avoid registering plugins twice.
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static layout...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`--------------------------------------------------`);
    console.log(`🎉 Full Stack Food Delivery backend live at port: ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`--------------------------------------------------`);
  });
}

startServer();
