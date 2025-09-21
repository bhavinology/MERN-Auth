import redisClient from "../index.js";
import TryCatch from "../middlewares/trycatch.js";
import UserModel from "../models/userModel.js";

const verifyUser = TryCatch(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({
      message: "verification token not found",
    });
  }
  const verificationKey = `verify:${token}`;
  const userDataJSON = await redisClient.get(verificationKey);
  if (!userDataJSON) {
    return res.status(400).json({
      message: "verification link is expired",
    });
  }
  await redisClient.del(verificationKey);
  const userData = JSON.parse(userDataJSON);
  const newUser = await UserModel.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });
  res.status(201).json({
    message: "user registered successfully",
    user: {
      _id: newUser._id,
      name: newUser.name,
    },
  });
});

export default verifyUser;
