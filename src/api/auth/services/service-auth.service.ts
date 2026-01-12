import crypto from "crypto";
import { BaseService } from "../../../base/base.service";
import { ServiceReturnDto } from "../../../core/utils/responseHandler";
import jwtUtils from "../../../core/utils/jwt.utils";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

const SERVICE_TOKEN_EXPIRES_IN = 15 * 60; // 15 minutes
const SERVICE_GRANT_TYPE = "client_credentials" as const;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface GetServiceTokenPayload {
  clientId: string;
  clientSecret: string;
  grantType: typeof SERVICE_GRANT_TYPE;
}

export interface RegisterServicePayload {
  name: string;
  description?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 SERVICE                                    */
/* -------------------------------------------------------------------------- */

export class ServiceAuthService extends BaseService {
  /**
   * OAuth2 Client Credentials Grant
   */
  async getToken(payload: GetServiceTokenPayload): Promise<ServiceReturnDto> {
    const { clientId, clientSecret, grantType } = payload;

    if (grantType !== SERVICE_GRANT_TYPE) {
      return this.throwError(
        `Invalid grant type. Expected '${SERVICE_GRANT_TYPE}'.`
      );
    }

    const serviceClient = await this.db.serviceClient.findUnique({
      where: { client_id: clientId },
    });

    if (!serviceClient || !serviceClient.is_active) {
      return this.throwUnauthorized("Invalid client credentials.");
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(clientSecret)
      .digest("hex");

    /**
     * Timing-safe comparison to prevent side-channel attacks
     */
    const isSecretValid = crypto.timingSafeEqual(
      Buffer.from(incomingHash),
      Buffer.from(serviceClient.client_secret_hash)
    );

    if (!isSecretValid) {
      return this.throwUnauthorized("Invalid client credentials.");
    }

    const accessToken = jwtUtils.generateServiceToken({
      serviceId: serviceClient.id,
      clientId: serviceClient.client_id,
      name: serviceClient.name,
    });

    return {
      statusCode: 200,
      message: "Access token generated successfully.",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: SERVICE_TOKEN_EXPIRES_IN,
      },
    };
  }

  /**
   * Register internal or third-party service
   */
  async registerService(
    payload: RegisterServicePayload
  ): Promise<ServiceReturnDto> {
    const { name, description } = payload;

    const clientId = `svc_${crypto.randomBytes(8).toString("hex")}`;
    const clientSecret = crypto.randomBytes(32).toString("hex");

    const clientSecretHash = crypto
      .createHash("sha256")
      .update(clientSecret)
      .digest("hex");

    const serviceClient = await this.db.serviceClient.create({
      data: {
        name,
        description,
        client_id: clientId,
        client_secret_hash: clientSecretHash,
        is_active: true,
      },
    });

    /**
     * IMPORTANT:
     * clientSecret is returned ONLY once.
     * Never store or show again.
     */
    return {
      statusCode: 201,
      message: "Service client registered successfully.",
      data: {
        clientId: serviceClient.client_id,
        clientSecret,
        name: serviceClient.name,
      },
    };
  }
}
