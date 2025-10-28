import { prisma } from "../prisma/client";

export class BaseService {
  protected db = prisma;
  protected cache: any = null; // Will be implemented when cache is added

  constructor() {
    // Initialize any common service dependencies here
  }

  // Method to set cache if needed
  setCache(cacheInstance: any) {
    this.cache = cacheInstance;
  }

  // Common methods that all services might need can be added here
  async findById<T>(model: keyof typeof prisma, id: string): Promise<T | null> {
    return (this.db[model] as any).findUnique({
      where: { id },
    });
  }

  async findAll<T>(
    model: keyof typeof prisma,
    filters: any = {}
  ): Promise<T[]> {
    return (this.db[model] as any).findMany(filters);
  }

  async create<T>(model: keyof typeof prisma, data: any): Promise<T> {
    return (this.db[model] as any).create({ data });
  }

  async update<T>(
    model: keyof typeof prisma,
    id: string,
    data: any
  ): Promise<T> {
    return (this.db[model] as any).update({
      where: { id },
      data,
    });
  }

  async delete<T>(model: keyof typeof prisma, id: string): Promise<T> {
    return (this.db[model] as any).delete({
      where: { id },
    });
  }
}
