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
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new booking
router.post("/", authenticateToken, async (req, res) => {
  const { userId, propertyId, checkinDate, checkoutDate, numberOfGuests, totalPrice, bookingStatus } = req.body;
  if (!userId || !propertyId || !checkinDate || !checkoutDate || !numberOfGuests || !totalPrice || !bookingStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: { userId, propertyId, checkinDate: new Date(checkinDate), checkoutDate: new Date(checkoutDate), numberOfGuests, totalPrice, bookingStatus },
    });
    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT booking by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { userId, propertyId, checkinDate, checkoutDate, numberOfGuests, totalPrice, bookingStatus } = req.body;

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { userId, propertyId, checkinDate: new Date(checkinDate), checkoutDate: new Date(checkoutDate), numberOfGuests, totalPrice, bookingStatus },
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
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Booking not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
