import mongoose, { Schema, Document, models } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  itemName: string;
  category: string;
  price: number;
  date: Date;
  source: string; // e.g., "Flipkart Minutes", "Blinkit"
}

const TransactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  itemName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: "Manual",
  },
});

const Transaction = models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
