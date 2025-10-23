export class UserService {
    async create(data: any) {
      // DB logic
      return { id: 1, ...data };
    }
  
    async login(data: any) {
      // Validate credentials, return JWT token
      return "jwt_token_example";
    }
  }
  