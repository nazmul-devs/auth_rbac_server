import { UserStatus } from "../generated/prisma";

interface IUser {
  id: string;
  email: string;
  username: string;
  name: string;
  status: UserStatus;
}

declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user?: IUser;
    }
  }
}
