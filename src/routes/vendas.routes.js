import { Router } from "express";
import VendasController from '../app/controllers/Vendas.Controller.js'

const router = Router();

router.get("/", (req, res) => VendasController.index(req, res));
router.post("/", (req, res) => VendasController.store(req, res));
router.get("/:id", (req, res) => VendasController.show(req, res));
router.put("/:id", (req, res) => VendasController.update(req, res));
router.delete("/:id", (req, res) => VendasController.delete(req, res));

export default router;
