import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function decodeBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const payload = decodeBearerToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
  req.userId = payload.sub;
  return next();
}

export function optionalAuth(req, res, next) {
  const payload = decodeBearerToken(req);
  req.userId = payload?.sub || null;
  return next();
}
