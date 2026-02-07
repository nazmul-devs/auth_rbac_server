import { RefreshTokenService } from "./auth.refresh-token.service";
import { AuthService } from "./auth.service";
import { TrustedDeviceService } from "./auth.trusted-device.service";

export const authService = {
  auth: new AuthService(),
  refreshToken: new RefreshTokenService(),
  trustedDevice: new TrustedDeviceService(),
};
