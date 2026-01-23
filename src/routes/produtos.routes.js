// src/routes/produtos.routes.js
import { Router } from "express";

import ProdutoController from '../app/controllers/ProdutoController.js'
const router = Router();

router.get("/", (req, res) => ProdutoController.index(req, res));
router.post("/", (req, res) => ProdutoController.store(req, res));
router.get("/estoque-baixo", (req, res) =>
  ProdutoController.estoqueBaixo(req, res),
);

export default router;
