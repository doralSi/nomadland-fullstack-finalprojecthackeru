import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user is frozen
        const user = await User.findById(verified.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        if (user.status === 'frozen') {
            return res.status(403).json({ message: "Your account has been frozen. Please contact support." });
        }

        req.user = verified; // מוסיף את ה־user decoded לבקשה
        next();

    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Token is invalid or expired" });
    }
};

// Optional auth - allows both authenticated and unauthenticated requests
export const optionalAuthMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
        }
        
        next();
    } catch (err) {
        // If token is invalid, just continue without user
        next();
    }
};
