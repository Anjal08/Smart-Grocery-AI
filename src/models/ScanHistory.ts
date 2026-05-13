import mongoose, { Schema, Document, models } from "mongoose";

export interface IScanHistory extends Document {
  storeName: string;
  totalAmount: number;
  totalSavings: number;
  itemCount: number;
  date: Date;
}

const ScanHistorySchema = new Schema<IScanHistory>({
  storeName: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  totalSavings: {
    type: Number,
    required: true,
  },
  itemCount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ScanHistory = models.ScanHistory || mongoose.model<IScanHistory>("ScanHistory", ScanHistorySchema);
export default ScanHistory;
