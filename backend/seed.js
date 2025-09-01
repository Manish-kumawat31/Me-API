// backend/seed.js
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Profile = require("./models/Profile");

dotenv.config();

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");
  mongoose.connect(uri)
    .then(() => {
      console.log("✅ MongoDB connected");
    })
    .catch(err => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // exit if DB fails
    });

  const data = JSON.parse(fs.readFileSync("./seed.json", "utf-8"));
  await Profile.findOneAndUpdate({}, data, { upsert: true, new: true });
  console.log("Seeded profile");
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });

