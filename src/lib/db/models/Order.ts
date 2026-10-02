import mongoose, { Schema, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IOrder {
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: "Processing" | "In Atelier" | "Dispatched" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Settled" | "Failed";
  trackingNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    deliveryMethod: { type: String, default: "standard" },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "In Atelier", "Dispatched", "Delivered", "Cancelled"],
      default: "Processing",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Settled", "Failed"],
      default: "Settled",
    },
    trackingNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
