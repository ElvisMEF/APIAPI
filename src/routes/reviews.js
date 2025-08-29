import express from "express";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET review by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new review
router.post("/", authenticateToken, async (req, res) => {
  const { userId, propertyId, rating, comment } = req.body;
  if (!userId || !propertyId || !rating || !comment) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newReview = await prisma.review.create({
      data: { userId, propertyId, rating, comment },
    });
    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT review by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });
    res.json(updatedReview);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Review not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE review by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Review not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
