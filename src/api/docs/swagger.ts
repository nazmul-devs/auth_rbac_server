import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth RBAC API",
      version: "1.0.0",
      description: "Official API documentation for Auth & RBAC Service",
    },
    servers: [
      {
        url: "http://localhost:5003/api/v1",
        description: "Development server",
      },
    ],
  },

  // 👇 IMPORTANT: scan only swagger files
  apis: ["src/api/**/**/*.swagger.ts", "src/api/docs/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
