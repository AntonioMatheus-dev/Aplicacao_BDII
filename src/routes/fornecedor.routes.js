import { Router } from "express";
import FornecedorController from '../app/controllers/FornecedorController.js'

const router = Router();

router.get("/", (req, res) => FornecedorController.index(req, res));
router.post("/", (req, res) => FornecedorController.store(req, res));
router.post("/promote", (req, res) => FornecedorController.promote(req, res));
router.get("/:id", (req, res) => FornecedorController.show(req, res));
router.put("/:id", (req, res) => FornecedorController.update(req, res));
router.delete("/:id", (req, res) => FornecedorController.delete(req, res));

export default router;
