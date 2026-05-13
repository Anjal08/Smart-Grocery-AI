import mongoose, { Schema, Document, models } from "mongoose";

/**
 * PurchaseLog — Tracks per-item purchase frequency for predictive analytics.
 * Each document represents a unique item (by normalized name) and stores
 * all historical purchase timestamps for interval calculation.
 */

export interface IPurchaseLog extends Document {
  userId?: mongoose.Types.ObjectId;
  itemName: string;
  category: string;
  purchaseDates: Date[];
  avgIntervalDays: number;
  lastPurchaseDate: Date;
  predictedRefillDate: Date;
  isStaple: boolean;
}

const PurchaseLogSchema = new Schema<IPurchaseLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    itemName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Staples",
    },
    purchaseDates: {
      type: [Date],
      default: [],
    },
    avgIntervalDays: {
      type: Number,
      default: 0,
    },
    lastPurchaseDate: {
      type: Date,
      default: Date.now,
    },
    predictedRefillDate: {
      type: Date,
    },
    isStaple: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

PurchaseLogSchema.index({ itemName: 1, userId: 1 }, { unique: true });

const PurchaseLog =
  models.PurchaseLog ||
  mongoose.model<IPurchaseLog>("PurchaseLog", PurchaseLogSchema);
export default PurchaseLog;
