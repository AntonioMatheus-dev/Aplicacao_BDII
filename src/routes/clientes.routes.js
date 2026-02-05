import { Router } from "express";
import ClienteController from '../app/controllers/ClienteController.js'

const router = Router();

router.get("/", (req, res) => ClienteController.index(req, res));
router.post("/", (req, res) => ClienteController.store(req, res));
router.post("/promote", (req, res) => ClienteController.promote(req, res));
router.get("/:id", (req, res) => ClienteController.show(req, res));
router.put("/:id", (req, res) => ClienteController.update(req, res));
router.delete("/:id", (req, res) => ClienteController.delete(req, res));

export default router;
