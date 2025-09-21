import express from "express";
import registerUser from "../controller/registerUser.js";
import verifyUser from "../controller/verifyUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);

export default router;
