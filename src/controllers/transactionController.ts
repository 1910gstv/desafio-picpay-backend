import { Request, Response } from "express";
import { prismaClient } from "../database/prismaClient";

export class TransactionController {
  public async transaction(request: Request, response: Response) {
    const { sender, receiver, amount } = request.body;
    try {
      const userSender = await prismaClient.user.findUnique({
        where: {
          documents: sender,
        },
      });
      const userReceiver = await prismaClient.user.findUnique({
        where: {
          documents: receiver,
        },
      });

      !userSender ? "Sender not found" : userSender;
      !userReceiver ? "Receiver not found" : userReceiver;

      if (userSender!.userType === 1) {
        return response
          .status(400)
          .send("Esse usuário não pode fazer transferências");
      }

      if (userSender!.balance < amount) {
        return response
          .status(400)
          .send("Saldo insuficiente para essa transição");
      }

      const auth = await fetch("https://util.devi.tools/api/v2/authorize");
      const authResponse = (await auth.json()) as AuthResponse;

      if (authResponse.data.authorization != true) {
        return response.status(404).send("Transfência não autorizada");
      }

      const updateSenderBalance = (userSender!.balance -= amount);
      const updateReceiverBalance = (userReceiver!.balance += amount);

      const id_sender = userSender ? userSender.id : userSender;
      const id_receiver = userReceiver ? userReceiver.id : userReceiver;

      await prismaClient.user.update({
        where: {
          id: id_sender!,
        },
        data: {
          balance: updateSenderBalance,
        },
      });

      await prismaClient.user.update({
        where: {
          id: id_receiver!,
        },
        data: {
          balance: updateReceiverBalance,
        },
      });

      const createdTransaction = await prismaClient.transaction.create({
        data: {
          sender: id_sender!,
          receiver: id_receiver!,
          amount,
        },
      });

      return response.status(200).json({
        transaction: createdTransaction,
        sender: userSender,
        receiver: userReceiver,
      });
    } catch (error) {
      return response.status(500).json(error);
    }
  }
}

interface AuthResponse {
  status: number;
  data: {
    authorization: boolean;
  };
}
