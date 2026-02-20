import { Router } from "express";
import PessoaController from '../app/controllers/Pessoa.Controller.js'

const router = Router();

router.get("/", (req, res) => PessoaController.index(req, res));
router.post("/", (req, res) => PessoaController.store(req, res));
router.get("/:id", (req, res) => PessoaController.show(req, res));
router.put("/:id", (req, res) => PessoaController.update(req, res));
router.delete("/:id", (req, res) => PessoaController.delete(req, res));

export default router;
