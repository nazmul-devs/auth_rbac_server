import { NextFunction, Request, Response } from "express";
import { prisma } from "../database/prisma";

export const requirePermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthenticated" });

    const roles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    const perms = new Set<string>();
    roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => perms.add(rp.permission.name));
    });

    if (!perms.has(permissionName))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
};
