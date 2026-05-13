import mongoose, { Schema, Document, models } from "mongoose";

export interface IPriceLog extends Document {
  itemName: string;
  price: number;
  date: Date;
  source?: string;
  platform?: string;
}

const PriceLogSchema = new Schema<IPriceLog>({
  itemName: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: "Market Scraper"
  },
  platform: {
    type: String,
    default: "Unknown"
  }
});

// Index for getting latest price quickly (per-platform)
PriceLogSchema.index({ itemName: 1, platform: 1, date: -1 });

const PriceLog = models.PriceLog || mongoose.model<IPriceLog>("PriceLog", PriceLogSchema);
export default PriceLog;
