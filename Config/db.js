const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.BASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Failed:", err.message));
