import {
  Business,
  LogActivity,
  Order,
  OrderItem,
  Outcome,
  ParentBusiness,
  Product,
  ProductCategory,
  Recipe,
  Stock,
  Transaction,
  User,
} from "@prisma/client";

// MASTER DATA

export interface DetailBusiness extends Business {
  orders: DetailOrder[];
  products: DetailProduct[];
  outcomes: DetailOutcome[];
  transactions: DetailTransaction[];
  parentBusiness: DetailParentBusiness;
  _count: {
    orders: number;
    products: number;
    outcomes: number;
    transactions: number;
  };
}

export interface DetailParentBusiness extends ParentBusiness {
  businesses: DetailBusiness[];
  _count: { businesses: number };
}

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
}

// TRANSACTION IN DATA

export interface DetailOrder extends Order {
  orderItems: DetailOrderItem[];
  business: DetailBusiness;
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

// TRANSACTION OUT DATA

export interface DetailOutcome extends Outcome {
  stock: DetailStock;
}

// TRANSACTION FOR ACOUNTANT

export interface DetailTransaction extends Transaction {
  business: DetailBusiness;
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
