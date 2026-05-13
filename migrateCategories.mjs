import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net";

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection failed");
    
    console.log("Migrating 'Produce' to 'Vegetables'...");
    const res1 = await db.collection('inventories').updateMany(
      { category: 'Produce' },
      { $set: { category: 'Vegetables' } }
    );
    console.log(`Updated ${res1.modifiedCount} items from Produce to Vegetables.`);

    console.log("Mapping non-standard categories to 'Staples'...");
    const allowed = ['Fruits', 'Vegetables', 'Dairy', 'Staples', 'Oil', 'Snacks'];
    const res2 = await db.collection('inventories').updateMany(
      { category: { $nin: allowed } },
      { $set: { category: 'Staples' } }
    );
    console.log(`Updated ${res2.modifiedCount} items to Staples.`);

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
