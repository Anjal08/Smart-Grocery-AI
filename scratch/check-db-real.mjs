import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const InventorySchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  purchaseDate: { type: Date, default: Date.now }
});

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);

async function check() {
  const uri = process.env.MONGODB_URI;
  console.log(`Connecting to: ${uri}`);
  await mongoose.connect(uri);
  const count = await Inventory.countDocuments();
  console.log(`Total items: ${count}`);
  const items = await Inventory.find().sort({ purchaseDate: -1 }).limit(10);
  console.log('Items:', JSON.stringify(items, null, 2));
  process.exit(0);
}

check();
