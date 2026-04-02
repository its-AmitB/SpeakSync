import mongoose from "mongoose";
import { StreamChat } from "stream-chat";
import "dotenv/config";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Initialize Stream (note: your env has STEAM instead of STREAM)
const streamClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

const cleanup = async () => {
  await connectDB();

  try {
    console.log("🧹 Starting cleanup...\n");

    // 1. Clear MongoDB collections
    console.log("1️⃣ Clearing MongoDB...");
    const db = mongoose.connection.db;
    
    // Drop all collections
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`   ✅ Cleared: ${collection.name}`);
    }

    // 2. Clear Stream users
    console.log("\n2️⃣ Clearing Stream users...");
    try {
      const users = await streamClient.queryUsers({});
      if (users.users.length > 0) {
        const userIds = users.users.map(u => u.id);
        await streamClient.deleteUsers(userIds, { user: 'hard' });
        console.log(`   ✅ Deleted ${userIds.length} Stream users`);
      } else {
        console.log("   ℹ️ No Stream users found");
      }
    } catch (error) {
      console.log(`   ⚠️ Stream users error: ${error.message}`);
    }

    // 3. Clear Stream channels
    console.log("\n3️⃣ Clearing Stream channels...");
    try {
      const channels = await streamClient.queryChannels({});
      for (const channel of channels) {
        await channel.delete();
        console.log(`   ✅ Deleted channel: ${channel.id}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Stream channels error: ${error.message}`);
    }

    console.log("\n🎉 Cleanup completed!");

  } catch (error) {
    console.error("❌ Cleanup error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

cleanup();
