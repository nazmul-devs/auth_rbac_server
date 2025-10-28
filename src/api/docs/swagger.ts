import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth RBAC API Docs",
      version: "1.0.0",
      description: "Official API documentation for Auth RBAC backend",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development server",
      },
    ],
  },
  apis: ["../**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
