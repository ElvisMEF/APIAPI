import express from "express";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /hosts - Get all hosts or filter by name
router.get("/", async (req, res) => {
  const { name } = req.query;
  try {
    const hosts = name
      ? await prisma.host.findMany({ where: { name } })
      : await prisma.host.findMany();
    res.json(hosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /hosts/:id - Get host by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const host = await prisma.host.findUnique({ where: { id } });
    if (!host) return res.status(404).json({ error: "Host not found" });
    res.json(host);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /hosts - Create a new host
router.post("/", authenticateToken, async (req, res) => {
  const { username, password, name, email, phoneNumber, pictureUrl, aboutMe } = req.body;
  if (!username || !password || !name || !email || !phoneNumber) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newHost = await prisma.host.create({
      data: { username, password, name, email, phoneNumber, pictureUrl, aboutMe },
    });
    res.status(201).json(newHost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /hosts/:id - Update host by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password, name, email, phoneNumber, pictureUrl, aboutMe } = req.body;

  try {
    const updatedHost = await prisma.host.update({
      where: { id },
      data: { username, password, name, email, phoneNumber, pictureUrl, aboutMe },
    });
    res.json(updatedHost);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Host not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /hosts/:id - Delete host by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.host.delete({ where: { id } });
    res.json({ message: "Host deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Host not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
