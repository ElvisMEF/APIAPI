import express from "express";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET booking by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET bookings by userId query
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await prisma.booking.findMany({ where: { userId } });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new booking
router.post("/", authenticateToken, async (req, res) => {
  const { userId, propertyId, startDate, endDate, totalPrice } = req.body;
  if (!userId || !propertyId || !startDate || !endDate || !totalPrice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: { userId, propertyId, startDate: new Date(startDate), endDate: new Date(endDate), totalPrice },
    });
    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT booking by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId, propertyId, startDate, endDate, totalPrice } = req.body;

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { userId, propertyId, startDate: new Date(startDate), endDate: new Date(endDate), totalPrice },
    });
    res.json(updatedBooking);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Booking not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE booking by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Booking not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
