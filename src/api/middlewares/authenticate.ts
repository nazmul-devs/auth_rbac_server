import { NextFunction, Request, Response } from "express";
import jwtUtils from "../../core/utils/jwt.utils";
import { prisma } from "../../prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwtUtils.verifyRefreshToken(token);

      if (!decoded)
        res.status(401).json({ message: "Invalid or expired token" });
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Optional: Validate the user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
      },
    });

    if (!user)
      return res.status(401).json({ message: "User no longer exists" });

    if (user.status === "SUSPENDED")
      return res.status(403).json({ message: "Your account is suspended" });

    // Attach user to request object
    (req as any).user = user;

    return next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
