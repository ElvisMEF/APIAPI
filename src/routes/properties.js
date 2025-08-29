import express from "express";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all properties or with query filters
router.get("/", async (req, res) => {
  const { location, pricePerNight } = req.query;
  try {
    const properties = await prisma.property.findMany({
      where: {
        location: location || undefined,
        pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
      },
    });
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET property by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new property
router.post("/", authenticateToken, async (req, res) => {
  const { name, location, pricePerNight, maxGuestCount, hostId } = req.body;
  if (!name || !location || !pricePerNight || !maxGuestCount || !hostId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newProperty = await prisma.property.create({
      data: { name, location, pricePerNight, maxGuestCount, hostId },
    });
    res.status(201).json(newProperty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT property by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, location, pricePerNight, maxGuestCount, hostId } = req.body;

  try {
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { name, location, pricePerNight, maxGuestCount, hostId },
    });
    res.json(updatedProperty);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Property not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE property by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id } });
    res.json({ message: "Property deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Property not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
