import { Request } from "express";

export interface IMiddlewareUser {
  id?: number;
  role?: string;
}
export interface AuthenticatedRequest extends Request {
  id?: number;
}

export interface ControllerRequest extends Request {
  id?: number;
}
