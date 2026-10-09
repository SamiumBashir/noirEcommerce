import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  isActive: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  isEmailVerified?: boolean;
  emailVerificationOtpHash?: string;
  emailVerificationExpiresAt?: Date;
  emailVerificationAttempts?: number;
  emailVerificationLastSentAt?: Date;
  welcomeEmailSentAt?: Date;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  deactivatedAt?: Date;
  deactivationReason?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationOtpHash: {
      type: String,
      select: false, // Hidden by default from queries for extra security
    },
    emailVerificationExpiresAt: {
      type: Date,
      index: true,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },
    emailVerificationLastSentAt: {
      type: Date,
    },
    welcomeEmailSentAt: {
      type: Date,
      index: true,
    },
    verificationOtp: {
      type: String,
      select: false,
    },
    verificationOtpExpires: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    deactivatedAt: {
      type: Date,
    },
    deactivationReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize isVerified and isEmailVerified before save
UserSchema.pre("save", function (next) {
  if (this.isVerified && this.isEmailVerified === undefined) {
    this.isEmailVerified = true;
  }
  if (this.isEmailVerified && !this.isVerified) {
    this.isVerified = true;
  }
  next();
});

// Method to verify candidate password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Static helper to hash passwords
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
