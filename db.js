const mongoose = require('mongoose');
mongoose.connect();
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
await mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("Database connected successfully");