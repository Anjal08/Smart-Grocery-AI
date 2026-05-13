import mongoose from 'mongoose';

const uri = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net/";

const main = async () => {
    await mongoose.connect(uri);
    
    const inventorySchema = new mongoose.Schema({
      name: String, brand: String, price: Number, category: String, estimatedExpiryDate: Date, status: String
    });
    const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

    const items = [
      { name: "Beetroot 500-600g", category: "Produce", price: 19 },
      { name: "Lemon 250g", category: "Produce", price: 45 },
      { name: "Green Chilli 100g", category: "Produce", price: 7 },
      { name: "Capsicum Green 250g", category: "Produce", price: 15 },
      { name: "Brinjal Bharta", category: "Produce", price: 16 },
      { name: "Tomato Local 500g", category: "Produce", price: 18 },
      { name: "Spring Onion 250-275g", category: "Produce", price: 11 },
      { name: "Cabbage 500-800g", category: "Produce", price: 10 }
    ];

    const expiryTime = Date.now() + 86400000 * 7; // 7 days standard for produce

    for(let item of items) {
       await new Inventory({ ...item, brand: "Commodum", estimatedExpiryDate: new Date(expiryTime), status: "fresh" }).save();
    }
    console.log("SUCCESS");
    process.exit(0);
};

main().catch(console.error);
