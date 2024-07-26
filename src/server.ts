import express from "express";
import { router } from "./routes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

const port = process.env.PORT ?? 8085;

app.listen(port, () => console.log("Servidor rodando na porta", port));
