import {
  Customer,
  Defect,
  LogActivity,
  Order,
  OrderItem,
  Outcome,
  Product,
  ProductCategory,
  Recipe,
  Stock,
  User,
} from "@prisma/client";

// PRODUCT

export interface DetailProduct extends Product {
  productCategory: DetailProductCategory;
  recipes: DetailRecipe[];
  orderItems: DetailOrderItem[];
  _count: { recipes: number; orderItems: number };
}

export interface DetailProductCategory extends ProductCategory {
  products: DetailProduct[];
  _count: { products: number };
}

export interface DetailRecipe extends Recipe {
  product: DetailProduct;
  stock: DetailStock;
}

export interface DetailStock extends Stock {
  recipes: DetailRecipe[];
  outcomes: DetailOutcome[];
  defects: DetailDefect[];
  _count: { recipes: number; outcomes: number };
}

export interface DetailDefect extends Defect {
  stock: DetailStock;
}

export interface DetailOrder extends Order {
  orderItems: DetailOrderItem[];
  customer: DetailCustomer | null;
  _count: { orderItems: number };
}

export interface DetailOrderItem extends OrderItem {
  product: DetailProduct;
  order: DetailOrder;
  _count: { order: number };
}

export interface DetailOrderByDate {
  date: string;
  orders: DetailOrder[];
}

export interface DetailOutcome extends Outcome {
  stock: DetailStock;
}

// LOG DATA
export interface DetailLogActivity extends LogActivity {
  user: DetailUser;
}

// USER
export interface DetailUser extends User {
  logActivities: DetailLogActivity[];
  accessToken: string;
}

export interface Report {
  total: number;
  minus: number;
  plus: number;
}

export const initReport: Report = {
  total: 0,
  minus: 0,
  plus: 0,
};

// CUSTOMER

export interface DetailCustomer extends Customer {
  orders: DetailOrder[];
}
