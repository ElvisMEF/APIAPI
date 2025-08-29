// src/routes/users.js
import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /users?username=jdoe or /users?email=jdoe@example.com
router.get("/", authenticateToken, async (req, res) => {
  const { username, email } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: {
        username: username || undefined,
        email: email || undefined,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /users/:id
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /users
router.post("/", authenticateToken, async (req, res) => {
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

// PUT /users/:id
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password, name, email, phoneNumber, pictureUrl } = req.body;

  try {
    const data = { username, name, email, phoneNumber, pictureUrl };
    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    res.json(updatedUser);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /users/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
