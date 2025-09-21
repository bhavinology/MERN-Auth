import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { createClient } from "redis";

dotenv.config();
await connectDB();
const app = express();
app.use(express.json());

// redis client setup
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.log("missing redis url");
  process.exit(1);
}
const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("redis connected"))
  .catch((err) => {
    console.log("redis connection error:", err);
  });

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

export default redisClient;
