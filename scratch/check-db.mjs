import dbConnect from '../src/lib/mongodb.ts';
import Inventory from '../src/models/Inventory.ts';

async function checkInventory() {
  await dbConnect();
  
  const count = await Inventory.countDocuments();
  console.log(`Total items in inventory: ${count}`);
  
  const items = await Inventory.find().sort({ purchaseDate: -1 }).limit(5);
  console.log('Recent items:');
  console.log(JSON.stringify(items, null, 2));
  
  process.exit(0);
}

checkInventory();
