
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const pantry = await db.collection('pantries').find({}).toArray();
        console.log('Pantry items found:', pantry.length);
        console.log(JSON.stringify(pantry.slice(0, 5), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
