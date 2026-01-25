// src/app/app.js
import express from "express";
import routes from "./routes/index.js"; // estava ./app/routes...

const app = express();
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz com documentação

app.use(routes);

export default app;
