// src/routes/estoque.routes.js
import { Router } from "express";
import EstoqueController from '../app/controllers/EstoqueController.js'

const router = Router();

router.get("/estoque-baixo", (req, res) => EstoqueController.estoqueBaixo(req, res));
router.get("/produtos", (req, res) => EstoqueController.listarProdutos(req, res));
router.get("/historico/:produtoId", (req, res) => EstoqueController.historico(req, res));

export default router;
