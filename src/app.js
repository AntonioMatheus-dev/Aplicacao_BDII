// src/app/app.js
import express from "express";
import routes from "./routes/index.js"; // estava ./app/routes...

const app = express();
app.use(express.json());

// Rota raiz com documentação

app.use(routes);

export default app;
