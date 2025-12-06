import { BaseService } from "../../base/BaseService";

export class UserService extends BaseService {
  me = async (payload: { userId: string }) => {
    const { userId } = payload;

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
        created_at: true,
        two_fa_enabled: true,
        roles: true,
      },
    });

    if (!user) return this.throwError("User not found.");

    return {
      statusCode: 200,
      message: "User found.",
      data: user,
    };
  };
}
