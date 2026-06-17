import fs from "fs";
import path from "path";

// Define Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  cartData: Record<string, number>; // foodId -> qty
  isAdmin: boolean;
}

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  address: OrderAddress;
  status: "Food Processing" | "Preparing" | "Out For Delivery" | "Delivered";
  payment: boolean;
  createdAt: string;
}

// Data Directory
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const FOODS_FILE = path.join(DATA_DIR, "foods.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Ensure directory and files exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(FOODS_FILE)) {
    // Write pre-populated delicious food menu
    const initialFoods: Food[] = [
      {
        id: "food_1",
        name: "Margherita Pizza",
        description: "Classic tomato sauce, fresh buffalo mozzarella, organic basil, and extra virgin olive oil.",
        price: 14.99,
        category: "Italian",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_2",
        name: "Double Cheeseburger",
        description: "Two smashed Angus beef patties, aged cheddar cheese, caramelized onions, and house special burger sauce.",
        price: 12.49,
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_3",
        name: "Caesar Salad",
        description: "Crisp organic romaine lettuce, garlic herb croutons, hand-shaved Parmigiano-Reggiano, and house Caesar dressing.",
        price: 10.99,
        category: "Salads",
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_4",
        name: "Truffle Parmesan Fries",
        description: "Crisp double-fried golden fries tossed in white truffle oil, grated parmesan cheese, and fresh garden rosemary.",
        price: 6.99,
        category: "Sides",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_5",
        name: "Spicy Tuna Roll",
        description: "Spicy wild yellowfin tuna, crisp cucumber, creamy avocado, toasted sesame seeds, and signature spicy mayo.",
        price: 13.99,
        category: "Asian",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_6",
        name: "Royal Butter Chicken",
        description: "Rich, aromatic tomato-butter gravy with tender tandoori chicken, served with side fragrant basmati rice.",
        price: 16.99,
        category: "Asian",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_7",
        name: "Chocolate Lava Cake",
        description: "Decadent dark cocoa souffle with a warm, liquid molten chocolate center, served with house vanilla whip.",
        price: 7.99,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "food_8",
        name: "Matcha Crepe Cake",
        description: "Twenty delicate, paper-thin green tea crepes layers built up with organic Uji matcha sweet pastry cream.",
        price: 8.50,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1536680465769-2365207b035e?auto=format&fit=crop&q=80&w=600"
      }
    ];
    fs.writeFileSync(FOODS_FILE, JSON.stringify(initialFoods, null, 2));
  }
}

initDB();

// Atomic Helper for reading files
function readJSON<T>(filePath: string): T {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading database file: ${filePath}`, err);
    return [] as unknown as T;
  }
}

// Atomic Helper for writing files
function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing database file: ${filePath}`, err);
  }
}

// User Actions
export const dbUsers = {
  list: () => readJSON<User[]>(USERS_FILE),
  getById: (id: string) => readJSON<User[]>(USERS_FILE).find((u) => u.id === id),
  getByEmail: (email: string) => readJSON<User[]>(USERS_FILE).find((u) => u.email.toLowerCase() === email.toLowerCase()),
  add: (user: User) => {
    const list = readJSON<User[]>(USERS_FILE);
    list.push(user);
    writeJSON(USERS_FILE, list);
    return user;
  },
  update: (id: string, updates: Partial<User>) => {
    const list = readJSON<User[]>(USERS_FILE);
    const index = list.findIndex((u) => u.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      writeJSON(USERS_FILE, list);
      return list[index];
    }
    return null;
  }
};

// Food Actions
export const dbFoods = {
  list: () => readJSON<Food[]>(FOODS_FILE),
  getById: (id: string) => readJSON<Food[]>(FOODS_FILE).find((f) => f.id === id),
  add: (food: Food) => {
    const list = readJSON<Food[]>(FOODS_FILE);
    list.push(food);
    writeJSON(FOODS_FILE, list);
    return food;
  },
  remove: (id: string) => {
    const list = readJSON<Food[]>(FOODS_FILE);
    const filtered = list.filter((f) => f.id !== id);
    writeJSON(FOODS_FILE, filtered);
    return true;
  }
};

// Order Actions
export const dbOrders = {
  list: () => readJSON<Order[]>(ORDERS_FILE),
  getById: (id: string) => readJSON<Order[]>(ORDERS_FILE).find((o) => o.id === id),
  getByUserId: (userId: string) => readJSON<Order[]>(ORDERS_FILE).filter((o) => o.userId === userId),
  add: (order: Order) => {
    const list = readJSON<Order[]>(ORDERS_FILE);
    list.push(order);
    writeJSON(ORDERS_FILE, list);
    return order;
  },
  updateStatus: (id: string, status: Order["status"]) => {
    const list = readJSON<Order[]>(ORDERS_FILE);
    const index = list.findIndex((o) => o.id === id);
    if (index !== -1) {
      list[index].status = status;
      writeJSON(ORDERS_FILE, list);
      return list[index];
    }
    return null;
  },
  updatePaymentStatus: (id: string, payment: boolean) => {
    const list = readJSON<Order[]>(ORDERS_FILE);
    const index = list.findIndex((o) => o.id === id);
    if (index !== -1) {
      list[index].payment = payment;
      writeJSON(ORDERS_FILE, list);
      return list[index];
    }
    return null;
  }
};
