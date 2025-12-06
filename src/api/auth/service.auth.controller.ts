import crypto from "crypto";
import { BaseService } from "../../base/BaseService";
import jwtUtils from "../../core/utils/jwt.utils";
import { ServiceReturnDto } from "../../core/utils/responseHandler";
import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../base/BaseController";

// Service Logic
class ServiceAuthService extends BaseService {
    getToken = async (payload: {
        clientId: string;
        clientSecret: string;
        grantType: string;
    }): Promise<ServiceReturnDto> => {
        const { clientId, clientSecret, grantType } = payload;

        if (grantType !== "client_credentials") {
            return this.throwError("Invalid grant type. Must be 'client_credentials'.");
        }

        // Find service client
        const serviceClient = await this.db.serviceClient.findUnique({
            where: { client_id: clientId },
        });

        if (!serviceClient || !serviceClient.is_active) {
            return this.throwUnauthorized("Invalid client credentials.");
        }

        // Verify secret
        // Note: In production, store hash. Here verifying if secret matches hash.
        // Assuming we store sha256 hash of the secret.
        const secretHash = crypto
            .createHash("sha256")
            .update(clientSecret)
            .digest("hex");

        if (secretHash !== serviceClient.client_secret_hash) {
            return this.throwUnauthorized("Invalid client credentials.");
        }

        // Generate token
        const accessToken = jwtUtils.generateServiceToken({
            id: serviceClient.id,
            clientId: serviceClient.client_id,
            name: serviceClient.name,
        });

        return {
            statusCode: 200,
            message: "Access token generated successfully.",
            data: {
                accessToken,
                tokenType: "Bearer",
                expiresIn: 900, // 15m
            },
        };
    };

    registerService = async (payload: {
        name: string;
        description?: string;
    }): Promise<ServiceReturnDto> => {
        const { name, description } = payload;

        // Generate credentials
        const clientId = "svc_" + crypto.randomBytes(8).toString("hex");
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
            },
        });

        return {
            statusCode: 201,
            message: "Service client registered successfully.",
            data: {
                clientId: serviceClient.client_id,
                clientSecret, // Show only once
                name: serviceClient.name,
            },
        };
    };
}

const serviceAuthService = new ServiceAuthService();

export class ServiceAuthController extends BaseController {
    getToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await serviceAuthService.getToken(req.body);
            this.sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    };

    registerService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await serviceAuthService.registerService(req.body);
            this.sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    };
}
