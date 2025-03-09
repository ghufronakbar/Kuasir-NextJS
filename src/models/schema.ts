import {
  Business,
  Order,
  OrderItem,
  Outcome,
  OutcomeCategory,
  ParentBusiness,
  Product,
  ProductCategory,
  Recipe,
  Stock,
} from "@prisma/client";

export interface DetailBusiness extends Business {
  orders: DetailOrder[];
  parentBusiness: DetailParentBusiness;
}

export interface DetailParentBusiness extends ParentBusiness {
  businesses: Business[];
}

export interface DetailOrder extends Order {
  orderItems: DetailOrderItem[];
  business: DetailBusiness;
}

export interface DetailOrderItem extends OrderItem {
  product: DetailProduct;
  order: DetailOrder;
}

export interface DetailProduct extends Product {
  productCategory: DetailProductCategory;
  recipes: DetailRecipe[];
}

export interface DetailProductCategory extends ProductCategory {
  products: DetailProduct[];
}

export interface DetailRecipe extends Recipe {
  product: DetailProduct;
  stock: DetailStock;
}

export interface DetailStock extends Stock {
  recipes: DetailRecipe[];
  outcomes: DetailOutcome[];
}

export interface DetailOutcome extends Outcome {
  stock: DetailStock;
  outcomeCategory: DetailOutcomeCategory;
}

export interface DetailOutcomeCategory extends OutcomeCategory {
  outcomes: DetailOutcome[];
}
