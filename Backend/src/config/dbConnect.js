import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const dbInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`Database connected to ${dbInstance.connection.host}`);
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
};

export default connectDB;