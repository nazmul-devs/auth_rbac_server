import express, { Application } from "express";

export const createApp = (): Application => {
  const app = express();
  app.disable("x-powered-by");
  return app;
};
