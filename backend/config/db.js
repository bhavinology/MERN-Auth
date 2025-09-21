import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "mern-auth1",
    });
    console.log("connected to db!");
  } catch (error) {
    console.log("oops!! failed to connect db!");
  }
};

export default connectDB;
