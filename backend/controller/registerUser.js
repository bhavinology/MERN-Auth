import redisClient from "../index.js";
import registerUserSchema from "../config/zod.js";
import TryCatch from "../middlewares/trycatch.js";
import sanitize from "mongo-sanitize";
import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";

const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerUserSchema.safeParse(sanitizedBody);
  if (!validation.success) {
    return res.status(400).json({
      message: "validation failed",
      error: validation.error.issues.map((issue) => issue.message),
    });
  }
  const { name, email, password } = validation.data;
  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many requests.Please try again later",
    });
  }
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationKey = `verify:${verificationToken}`;
  const dataToStore = JSON.stringify({ name, email, password: hashedPassword });
  await redisClient.set(verificationKey, dataToStore, { EX: 300 });

  const subject = "verification link - MERN Auth";
  const html = `
<p>Click the link below to verify your email:</p>
<a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">Verify Email</a>
<p>This link will expire in 5 minutes.</p>
`;
  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message: "Verification has been sent.Pls check email",
  });
});

export default registerUser;
