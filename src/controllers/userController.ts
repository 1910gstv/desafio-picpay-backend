import { Request, Response } from "express";
import { prismaClient } from "../database/prismaClient";

export class UserController {
  public async createUser(request: Request, response: Response) {
    const { name, email, password, documents, balance, userType } =
      request.body;

    try {
      const emailExists = await prismaClient.user.findUnique({
        where: { email: email },
      });
      const documentsExists = await prismaClient.user.findUnique({
        where: { documents: documents },
      });

      if (documentsExists && emailExists) {
        response
          .status(400)
          .json({ error: "Document and email already exists" });
      }
      if (emailExists) {
        response.status(400).json({ error: "Email already exists" });
      }

      if (documentsExists) {
        response.status(400).json({ error: "Document already exists" });
      }

      const newUserCreated = await prismaClient.user.create({
        data: {
          name,
          email,
          password,
          documents,
          balance: balance || 0,
          userType,
        },
      });

      return response.status(200).json(newUserCreated);
    } catch (error) {
      return response.status(500).json({ error: error });
    }
  }
}
