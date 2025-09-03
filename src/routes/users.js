import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all users (protected)
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new user (registration)
router.post("/", async (req, res) => {
  const { username, password, name, email, phoneNumber, pictureUrl } = req.body;
  if (!username || !password || !name || !email || !phoneNumber) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword, name, email, phoneNumber, pictureUrl },
    });
    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT user by ID (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  const { username, password, name, email, phoneNumber, pictureUrl } = req.body;
  try {
    const data = { username, name, email, phoneNumber, pictureUrl };
    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updatedUser);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    if (err.code === "P2002") return res.status(400).json({ error: "Username or email already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE user by ID (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
