import jwt from "jsonwebtoken";

// Use JWT_SECRET from environment (which is "open" in your .env)
const SECRET = process.env.JWT_SECRET || "open";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    
    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
    });
}