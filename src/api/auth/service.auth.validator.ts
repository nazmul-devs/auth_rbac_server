import { z } from "zod";

export const ServiceAuthValidator = {
    getToken: z.object({
        body: z.object({
            clientId: z.string().min(1, "Client ID is required"),
            clientSecret: z.string().min(1, "Client Secret is required"),
            grantType: z.literal("client_credentials").default("client_credentials"),
        }),
    }),

    registerService: z.object({
        body: z.object({
            name: z.string().min(1, "Service name is required"),
            description: z.string().optional(),
        }),
    }),
};
