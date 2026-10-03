import mongoose, { Schema, Model, Document } from "mongoose";

export interface ILoginActivity {
  userId?: mongoose.Types.ObjectId | string;
  email: string;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
  emailNotificationSent: boolean;
  emailNotificationError?: string;
  emailJobId?: string;
  createdAt: Date;
}

export interface ILoginActivityDocument extends ILoginActivity, Document {}

const LoginActivitySchema = new Schema<ILoginActivityDocument>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: false,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
      default: "Unknown IP",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    browser: {
      type: String,
      default: "Unknown Browser",
    },
    os: {
      type: String,
      default: "Unknown OS",
    },
    location: {
      type: String,
      default: "Unknown Location",
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
      index: true,
    },
    failureReason: {
      type: String,
    },
    emailNotificationSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailNotificationError: {
      type: String,
    },
    emailJobId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for optimal queries and security auditing
LoginActivitySchema.index({ userId: 1, createdAt: -1 });
LoginActivitySchema.index({ email: 1, createdAt: -1 });
LoginActivitySchema.index({ createdAt: -1 });

export const LoginActivityModel: Model<ILoginActivityDocument> =
  mongoose.models.LoginActivity ||
  mongoose.model<ILoginActivityDocument>("LoginActivity", LoginActivitySchema);
