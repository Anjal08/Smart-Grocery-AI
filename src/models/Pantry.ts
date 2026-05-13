import mongoose, { Schema, Document, models } from "mongoose";

/**
 * Categorized Pantry Item — stores receipt-extracted items
 * with specific category classification for bento-style dashboard.
 */

export const PANTRY_CATEGORIES = [
  "Fresh Produce",
  "Snacks & Drinks",
  "Dairy & Bakery",
  "Staples",
] as const;

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

export interface IPantry extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
  category: PantryCategory;
  purchaseDate: Date;
  estimatedExpiryDate: Date;
  status: "in_stock" | "low" | "out" | "consumed";
  receiptId?: mongoose.Types.ObjectId;
  ingredients: string;
}

const PantrySchema = new Schema<IPantry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: "pcs",
    },
    category: {
      type: String,
      required: true,
      enum: PANTRY_CATEGORIES,
      default: "Staples",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    estimatedExpiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["in_stock", "low", "out", "consumed"],
      default: "in_stock",
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: "ScanHistory",
    },
    ingredients: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for deduplication checks
PantrySchema.index({ name: 1, brand: 1, purchaseDate: 1 });

if (mongoose.models.Pantry) {
  delete mongoose.models.Pantry;
}

const Pantry = mongoose.model<IPantry>("Pantry", PantrySchema);
export default Pantry;
