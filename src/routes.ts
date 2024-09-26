import { Router } from "express";
import { UserController } from "./controllers/userController";
import { TransactionController } from "./controllers/transactionController";

const router = Router();

const users = new UserController();
const transaction = new TransactionController();

router.post("/users", users.createUser);
router.post("/transaction", transaction.transaction);

export { router };
