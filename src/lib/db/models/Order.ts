import mongoose, { Schema, Model, Document } from "mongoose";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type ValidationStatus = "UNVERIFIED" | "VALIDATED" | "FAILED";

export interface IOrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IOrderAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  orderId: string;
  orderNumber?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: IOrderAddress;
  deliveryMethod?: "standard" | "priority";
  products: IOrderItem[];
  items?: IOrderItem[]; // Backward compatibility alias
  subtotal: number;
  shippingFee: number;
  shippingCost?: number; // Backward compatibility alias
  discount?: number;
  totalAmount: number;
  total?: number; // Backward compatibility alias
  currency: string; // e.g. "BDT" or "USD"
  payableAmountBdt?: number;
  paymentMethod: "SSLCOMMERZ" | "COD" | string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: string; // Backward compatibility alias
  transactionId?: string;
  bankTransactionId?: string;
  valId?: string;
  sslSessionKey?: string;
  validationStatus: ValidationStatus;
  trackingNumber: string;
  paymentDetails?: {
    cardType?: string;
    cardNo?: string;
    bankTranId?: string;
    tranDate?: string;
    cardIssuer?: string;
    cardBrand?: string;
    currencyType?: string;
    valId?: string;
    validatedAt?: Date;
    raw?: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderDocument = IOrder & Document;

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, index: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, default: "" },
    shippingAddress: { type: OrderAddressSchema, required: true },
    deliveryMethod: { type: String, enum: ["standard", "priority"], default: "standard" },
    products: { type: [OrderItemSchema], required: true },
    items: { type: [OrderItemSchema] },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    total: { type: Number },
    currency: { type: String, default: "BDT" },
    payableAmountBdt: { type: Number },
    paymentMethod: { type: String, required: true, default: "SSLCOMMERZ" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    status: { type: String },
    transactionId: { type: String, index: true },
    bankTransactionId: { type: String },
    valId: { type: String },
    sslSessionKey: { type: String },
    validationStatus: {
      type: String,
      enum: ["UNVERIFIED", "VALIDATED", "FAILED"],
      default: "UNVERIFIED",
    },
    trackingNumber: { type: String, required: true },
    paymentDetails: {
      cardType: { type: String },
      cardNo: { type: String },
      bankTranId: { type: String },
      tranDate: { type: String },
      cardIssuer: { type: String },
      cardBrand: { type: String },
      currencyType: { type: String },
      valId: { type: String },
      validatedAt: { type: Date },
      raw: { type: Schema.Types.Mixed },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderId: 1, transactionId: 1 });

// Synchronize backward-compatible aliases before saving
OrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = this.orderId;
  }
  if (!this.orderId && this.orderNumber) {
    this.orderId = this.orderNumber;
  }
  if (!this.total) {
    this.total = this.totalAmount;
  }
  if (!this.shippingCost) {
    this.shippingCost = this.shippingFee;
  }
  if (!this.items || this.items.length === 0) {
    this.items = this.products;
  }
  if (!this.products || this.products.length === 0) {
    this.products = this.items;
  }
  if (!this.status) {
    this.status = this.orderStatus;
  }
  next();
});

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
