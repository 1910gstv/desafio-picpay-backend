import { Router } from "express";
import { UserController } from "./controllers/userController";

const router = Router();

const users = new UserController();

router.post("/users", users.createUser);

export { router };
