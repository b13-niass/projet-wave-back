import { PrismaClient, User } from "@prisma/client";
import { ControllerRequest } from "../interface/Interface.js";
import { Response } from "express";
import { io } from "../app.js";
import { log } from "console";
import { hashPassword } from "../utils/password.js";

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

  async getAllAgence(req: ControllerRequest, res: Response) {
    const idUser = parseInt(req.id as string, 10);
    try {
      const user = await prisma.user.findUnique({ where: { id: idUser } });
      if (!user) {
        return res
          .status(404)
          .json({ data: [], message: "Utilisateur non trouvé", status: "KO" });
      }
      const agences = await prisma.agence.findMany();
      res.json({
        data: [
          {
            user,
            agences,
          },
        ],
        message: "Liste des agences récupérées avec succès",
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ data: [], message: "Internal Server Error", status: "KO" });
    }
  }

  async getUserPlafond(req: ControllerRequest, res: Response) {
    const idUser = parseInt(req.id as string, 10);
    try {
      const user = await prisma.user.findUnique({ where: { id: idUser } });
      if (!user) {
        return res
          .status(404)
          .json({ data: [], message: "Utilisateur non trouvé", status: "KO" });
      }
      const wallet = await prisma.wallet.findFirst({
        where: { user_id: idUser },
      });
      res.json({
        data: [
          {
            user,
            wallet,
          },
        ],
        message: "Plafond récupéré avec succès",
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ data: [], message: "Internal Server Error", status: "KO" });
    }
  }

  async changePassword(req: ControllerRequest, res: Response) {
    const idUser = parseInt(req.id as string, 10);
    let { password } = req.body;
    try {
      let user = await prisma.user.findUnique({ where: { id: idUser } });
      if (!user) {
        return res
          .status(404)
          .json({ data: [], message: "Utilisateur non trouvé", status: "KO" });
      }

      password = await hashPassword(password);

      user = await prisma.user.update({
        where: { id: idUser },
        data: { password },
      });
      delete (user as Partial<User>).password;

      res.json({
        data: [
          {
            user,
          },
        ],
        message: "Mot de passe modifié avec succès",
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ data: [], message: "Internal Server Error", status: "KO" });
    }
  }
}

export default new ClientController();
