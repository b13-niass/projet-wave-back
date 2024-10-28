import { Request } from "express";

export interface IMiddlewareUser {
  id?: string;
  role?: string;
}
export interface AuthenticatedRequest extends Request {
  user?: IMiddlewareUser;
  id?: string;
}

export interface ControllerRequest extends Request {
  id?: string;
}
