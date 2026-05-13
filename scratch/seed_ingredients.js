const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net";

const PantrySchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  quantity: Number,
  unit: String,
  category: String,
  purchaseDate: Date,
  estimatedExpiryDate: Date,
  status: String,
  ingredients: String,
}, { timestamps: true });

const Pantry = mongoose.models.Pantry || mongoose.model('Pantry', PantrySchema);

const now = new Date();
const in7  = new Date(now); in7.setDate(now.getDate() + 7);
const in14 = new Date(now); in14.setDate(now.getDate() + 14);
const in30 = new Date(now); in30.setDate(now.getDate() + 30);
const in60 = new Date(now); in60.setDate(now.getDate() + 60);
const in90 = new Date(now); in90.setDate(now.getDate() + 90);

const items = [
  {
    name: "Amul Butter (500g)",
    brand: "Amul",
    price: 275,
    quantity: 1,
    unit: "pcs",
    category: "Dairy & Bakery",
    purchaseDate: now,
    estimatedExpiryDate: in30,
    status: "in_stock",
    ingredients: "",
  },
  {
    name: "Amul Gold Milk (500ml)",
    brand: "Amul",
    price: 31,
    quantity: 1,
    unit: "pcs",
    category: "Dairy & Bakery",
    purchaseDate: now,
    estimatedExpiryDate: in7,
    status: "in_stock",
    ingredients: "",
  },
  {
    name: "Mother Dairy Paneer (200g)",
    brand: "Mother Dairy",
    price: 98,
    quantity: 1,
    unit: "pcs",
    category: "Dairy & Bakery",
    purchaseDate: now,
    estimatedExpiryDate: in14,
    status: "in_stock",
    ingredients: "",
  },
  {
    name: "Britannia Wheat Bread",
    brand: "Britannia",
    price: 45,
    quantity: 1,
    unit: "pcs",
    category: "Dairy & Bakery",
    purchaseDate: now,
    estimatedExpiryDate: in7,
    status: "in_stock",
    ingredients: "",
  },
  {
    name: "Tata Salt (1kg)",
    brand: "Tata",
    price: 24,
    quantity: 1,
    unit: "kg",
    category: "Staples",
    purchaseDate: now,
    estimatedExpiryDate: in90,
    status: "in_stock",
    ingredients: "",
  },
  {
    name: "Maggi Noodles (420g)",
    brand: "Nestle",
    price: 82,
    quantity: 1,
    unit: "pcs",
    category: "Staples",
    purchaseDate: now,
    estimatedExpiryDate: in60,
    status: "in_stock",
    ingredients: "",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Remove old copies of these exact items to avoid duplicates
    const names = items.map(i => i.name);
    await mongoose.connection.db.collection('pantries').deleteMany({ name: { $in: names } });
    console.log("Removed existing copies (if any)");

    const inserted = await mongoose.connection.db.collection('pantries').insertMany(
      items.map(i => ({ ...i, createdAt: now, updatedAt: now, __v: 0 }))
    );
    console.log(`✅ Inserted ${inserted.insertedCount} items:`);
    names.forEach(n => console.log("  •", n));
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seed();
