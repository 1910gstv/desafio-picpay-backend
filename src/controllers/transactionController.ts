import { Request, Response } from "express";
import { prismaClient } from "../database/prismaClient";
import Mail from "./mailerController";

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

      const sendMail = async (to: string, subject: string, message: string) => {
        try {
          Mail.to = to;
          Mail.subject = subject;
          Mail.message = message;

          const result = await Mail.sendMail();

          return {
            status: true,
            result,
            message: "E-mail enviado com sucesso!",
          };
        } catch (error) {
          return { error: error };
        }
      };

      const sendToSender = async () => {
        let to = userSender!.email;
        let subject = `Transferencia reaalizada com sucesso!`;
        let message = `Transferência realizada para ${to}`;

        const emailSender = await sendMail(to, subject, message);
        console.log(emailSender);
      };

      await sendToSender();

      const sendToReceiver = async () => {
        let to = userReceiver!.email;
        let subject = `Transferencia você recebeu uma transferência!`;
        let message = `Transferência recebida de ${userSender!.name}`;

        const sendReceiver = await sendMail(to, subject, message);
        console.log(sendReceiver);
      };

      await sendToReceiver();

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
