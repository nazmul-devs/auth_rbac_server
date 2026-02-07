import { prisma } from "../database";
import { throwUnauthorized, throwValidation } from "../errors/errors";

export class BaseService {
  protected db = prisma;

  // Error helpers
  protected throwError = throwValidation;
  protected throwUnauthorized = throwUnauthorized;

  // ---------- COMMON SAFE HELPERS ----------

  protected logError(context: string, error: unknown) {
    console.error(`[Service Error] ${context}`, error);
  }

  // ---------- OPTIONAL GENERIC HELPERS ----------

  async findById<T>(model: keyof typeof prisma, id: string): Promise<T | null> {
    try {
      return await (this.db[model] as any).findUnique({
        where: { id },
      });
    } catch (error) {
      this.logError(`findById(${String(model)})`, error);
      throw error;
    }
  }

  async findAll<T>(model: keyof typeof prisma, args?: any): Promise<T[]> {
    try {
      return await (this.db[model] as any).findMany(args);
    } catch (error) {
      this.logError(`findAll(${String(model)})`, error);
      throw error;
    }
  }

  async create<T>(model: keyof typeof prisma, data: any): Promise<T> {
    try {
      return await (this.db[model] as any).create({ data });
    } catch (error) {
      this.logError(`create(${String(model)})`, error);
      throw error;
    }
  }

  async update<T>(
    model: keyof typeof prisma,
    id: string,
    data: any,
  ): Promise<T> {
    try {
      return await (this.db[model] as any).update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logError(`update(${String(model)})`, error);
      throw error;
    }
  }

  async delete<T>(model: keyof typeof prisma, id: string): Promise<T> {
    try {
      return await (this.db[model] as any).delete({
        where: { id },
      });
    } catch (error) {
      this.logError(`delete(${String(model)})`, error);
      throw error;
    }
  }
}
