import express from "express";
import { bookSeat } from "../controllers/booking.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected route
router.put("/:id/:name", authMiddleware, bookSeat);

export default router;