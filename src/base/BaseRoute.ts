import { Router } from "express";

export abstract class BaseRoute<T> {
  public router: Router;
  protected controller: T;

  constructor(controller: T) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  protected abstract initializeRoutes(): void;
}
