import { Request } from "express";

export interface IMiddlewareUser {
  id?: number;
  role?: string;
}
export interface AuthenticatedRequest extends Request {

  user?: IMiddlewareUser;
  id?: string;
}

// export interface ControllerRequest extends Request {
//   id?: string;
// }


export interface ControllerRequest extends Request {

  user?: {
    id: number; // Type adapté à l'ID utilisateur
  };
}
