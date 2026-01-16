import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("Backend is working!"));

export default app;
