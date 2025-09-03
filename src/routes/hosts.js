import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all hosts
router.get("/", async (req, res) => {
  try {
    const hosts = await prisma.host.findMany();
    res.json(hosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
    console.log("Incoming Host Data:", req.body);
    let { username, password, name, email, phoneNumber, pictureUrl, aboutMe } = req.body;
  
    // Trim strings
    username = username?.trim();
    name = name?.trim();
    email = email?.trim();
    phoneNumber = phoneNumber?.trim();
    pictureUrl = pictureUrl?.trim();
    aboutMe = aboutMe?.trim();
  
    // Required fields
    if (!username || !password || !name || !email || !phoneNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newHost = await prisma.host.create({
        data: {
          username,
          password: hashedPassword,
          name,
          email,
          phoneNumber,
          pictureUrl: pictureUrl ?? null,
          aboutMe: aboutMe ?? null,
        },
      });
  
      res.status(201).json(newHost);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(400).json({ error: "Username or email already exists" });
      }
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  
  
  

// GET host by ID
router.get("/:id", async (req, res) => {
  try {
    const host = await prisma.host.findUnique({ where: { id: req.params.id } });
    if (!host) return res.status(404).json({ error: "Host not found" });
    res.json(host);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// PUT host by ID
router.put("/:id", authenticateToken, async (req, res) => {
  const { username, password, name, email, phoneNumber, pictureUrl, aboutMe } = req.body;

  try {
    const data = { username, name, email, phoneNumber, pictureUrl, aboutMe };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedHost = await prisma.host.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updatedHost);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Host not found" });
    if (err.code === "P2002") return res.status(400).json({ error: "Username or email already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE host by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.host.delete({ where: { id: req.params.id } });
    res.json({ message: "Host deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Host not found" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
