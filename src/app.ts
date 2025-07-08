import express from "express";
import cors from "cors";
import "dotenv/config"

import healthRouter from "./routes/health.route";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

