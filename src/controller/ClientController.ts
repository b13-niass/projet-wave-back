
import { PrismaClient } from "@prisma/client";
import { ControllerRequest } from "../interface/Interface.js";
import { Response } from "express";
import { io } from "../app.js";
import { log } from "console";

// const socket = io("http://localhost:5000");

const prisma = new PrismaClient();

class ClientController {
  constructor() {
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const val = (this as any)[key];
      if (key !== "constructor" && typeof val === "function") {
        (this as any)[key] = val.bind(this);
      }
    }
  }

  
}

export default new ClientController();
