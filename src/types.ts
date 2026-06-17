export interface User {
  id: string;
  name: string;
  email: string;
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

export interface CartItems {
  [itemId: string]: number; // itemId -> quantity
}
