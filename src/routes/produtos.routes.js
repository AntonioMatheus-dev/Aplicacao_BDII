// src/routes/produtos.routes.js
import { Router } from "express";

import ProdutoController from '../app/controllers/ProdutoController.js'
const router = Router();

router.get("/", (req, res) => ProdutoController.index(req, res));
router.post("/", (req, res) => ProdutoController.store(req, res));

// Specific routes first
router.get("/estoque-baixo", (req, res) =>
  ProdutoController.estoqueBaixo(req, res),
);

router.get("/:id/historico", (req, res) => ProdutoController.historico(req, res));
router.get("/movimentacoes", (req, res) => ProdutoController.movimentacoesGerais(req, res));

// Parameterized routes last
router.get("/:id", (req, res) => ProdutoController.show(req, res));
router.put("/:id", (req, res) => ProdutoController.update(req, res));
router.delete("/:id", (req, res) => ProdutoController.delete(req, res));

export default router;
