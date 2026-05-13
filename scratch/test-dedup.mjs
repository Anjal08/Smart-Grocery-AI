import dbConnect from '../src/lib/mongodb.ts';
import Inventory from '../src/models/Inventory.ts';

async function testDeduplication() {
  await dbConnect();
  
  const testItem = {
    name: "Test Milk",
    price: 50,
    category: "Dairy",
    estimatedExpiryDate: new Date()
  };

  console.log("Cleaning up old test items...");
  await Inventory.deleteMany({ name: "Test Milk" });

  console.log("Saving first item...");
  const item1 = new Inventory(testItem);
  await item1.save();

  const oneMinuteAgo = new Date(Date.now() - 60000);
  const duplicate = await Inventory.findOne({
    name: testItem.name,
    price: testItem.price,
    category: testItem.category,
    purchaseDate: { $gte: oneMinuteAgo }
  });

  if (duplicate) {
    console.log("Deduplication check PASSED: Found recent duplicate.");
  } else {
    console.log("Deduplication check FAILED: Recent duplicate NOT found.");
  }
  
  process.exit(0);
}

testDeduplication();
