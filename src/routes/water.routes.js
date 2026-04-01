import express from "express";
import { addWater, getWater, getWeeklyData, getStreak, leaderboard} from "../controllers/water.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", protect, addWater);   
router.get("/today", protect, getWater);
router.get("/weekly", protect, getWeeklyData);
router.get("/streak", protect, getStreak);
router.get("/leaderboard", protect, leaderboard);

export default router;