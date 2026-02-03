import { Router } from "express";
import ComprasController from '../app/controllers/ComprasController.js'

const router = Router();

router.get("/", (req, res) => ComprasController.index(req, res));
router.post("/", (req, res) => ComprasController.store(req, res));
router.get("/:id", (req, res) => ComprasController.show(req, res));
router.put("/:id", (req, res) => ComprasController.update(req, res));
router.delete("/:id", (req, res) => ComprasController.delete(req, res));

export default router;
