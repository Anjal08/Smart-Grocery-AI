import mongoose from 'mongoose';
const uri = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net/";
console.log("Attempting to connect to MongoDB...");
mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: MongoDB is reachable!');
    process.exit(0);
  })
  .catch(e => {
    console.error('ERROR: MongoDB failed to connect:', e.message);
    process.exit(1);
  });
