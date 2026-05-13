import mongoose, { Schema, Document, models } from "mongoose";

export interface IInventory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  brand?: string;
  price?: number;
  category: string;
  purchaseDate: Date;
  estimatedExpiryDate: Date;
  status: "fresh" | "expiring_soon" | "expired" | "consumed";
}

const InventorySchema = new Schema<IInventory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for now if we mock a single user
  },
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  price: {
    type: Number,
  },
  category: {
    type: String,
    required: true,
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
    enum: ["fresh", "expiring_soon", "expired", "consumed"],
    default: "fresh",
  },
});

const Inventory = models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);
export default Inventory;
