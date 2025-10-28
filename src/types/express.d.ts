import { JWTPayload } from "./jwt";

declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user?: JWTPayload;
    }
  }
}
