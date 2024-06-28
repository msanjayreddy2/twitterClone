import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`connected to mongodb:${conn.connection.host}`);
  } catch (error) {
    console.log(`unable to connect:${error.message}`);
    process.exit(1);
  }
};
