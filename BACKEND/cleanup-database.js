import mongoose from "mongoose";
import { StreamChat } from "stream-chat";
import "dotenv/config";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Initialize Stream Chat
const streamClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

// Define schemas (since we don't have direct access to models)
const userSchema = new mongoose.Schema({}, { strict: false });
const friendRequestSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

const cleanupDatabase = async () => {
  try {
    console.log("🧹 Starting database cleanup...\n");

    // 1. Delete all users from MongoDB
    console.log("1️⃣ Deleting all users from MongoDB...");
    const deletedUsers = await User.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.deletedCount} users from MongoDB\n`);

    // 2. Delete all friend requests from MongoDB
    console.log("2️⃣ Deleting all friend requests from MongoDB...");
    const deletedRequests = await FriendRequest.deleteMany({});
    console.log(`   ✅ Deleted ${deletedRequests.deletedCount} friend requests from MongoDB\n`);

    // 3. Clean up Stream Chat users
    console.log("3️⃣ Cleaning up Stream Chat users...");
    try {
      // Get all users from Stream
      const streamUsers = await streamClient.queryUsers({});
      console.log(`   📊 Found ${streamUsers.users.length} users in Stream`);

      if (streamUsers.users.length > 0) {
        // Delete users in batches
        const userIds = streamUsers.users.map(user => user.id);
        
        for (let i = 0; i < userIds.length; i += 10) {
          const batch = userIds.slice(i, i + 10);
          try {
            await streamClient.deleteUsers(batch, { user: 'hard' });
            console.log(`   ✅ Deleted batch of ${batch.length} users from Stream`);
          } catch (error) {
            console.log(`   ⚠️ Error deleting batch: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error cleaning Stream users: ${error.message}`);
    }

    // 4. Clean up Stream channels
    console.log("\n4️⃣ Cleaning up Stream channels...");
    try {
      // Query all channels
      const channels = await streamClient.queryChannels({});
      console.log(`   📊 Found ${channels.length} channels in Stream`);

      if (channels.length > 0) {
        for (const channel of channels) {
          try {
            await channel.delete();
            console.log(`   ✅ Deleted channel: ${channel.id}`);
          } catch (error) {
            console.log(`   ⚠️ Error deleting channel ${channel.id}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error cleaning Stream channels: ${error.message}`);
    }

    // 5. Clean up any other collections (optional)
    console.log("\n5️⃣ Cleaning up other collections...");
    try {
      // Get all collection names
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`   📊 Found ${collections.length} collections in database`);

      for (const collection of collections) {
        if (collection.name !== 'users' && collection.name !== 'friendrequests') {
          try {
            const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
            console.log(`   ✅ Cleaned collection '${collection.name}': ${result.deletedCount} documents deleted`);
          } catch (error) {
            console.log(`   ⚠️ Error cleaning collection '${collection.name}': ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error cleaning other collections: ${error.message}`);
    }

    console.log("\n🎉 Database cleanup completed successfully!");
    console.log("📋 Summary:");
    console.log(`   • MongoDB users: ${deletedUsers.deletedCount} deleted`);
    console.log(`   • MongoDB friend requests: ${deletedRequests.deletedCount} deleted`);
    console.log("   • Stream users and channels: cleaned up");
    console.log("   • All other collections: cleaned up");

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the cleanup
const runCleanup = async () => {
  console.log("🚨 WARNING: This will delete ALL data from your database and Stream!");
  console.log("🚨 This action cannot be undone!");
  console.log("⏳ Starting cleanup in 3 seconds...\n");
  
  // Wait 3 seconds to give user a chance to cancel
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await connectDB();
  await cleanupDatabase();
};

runCleanup();
