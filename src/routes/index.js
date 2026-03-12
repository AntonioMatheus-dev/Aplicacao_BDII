import { Router } from "express";
import produtoRoutes from "./produtos.routes.js";
import comprasRoutes from "./compras.routes.js";
import vendaRoutes from "./vendas.routes.js"
import clientesRoutes from "./clientes.routes.js";
import fornecedorRoutes from "./fornecedor.routes.js";
import pessoaRoutes from "./pessoa.routes.js";


const router = Router();

// Rota para manter o serviço acordado
router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

router.use("/produtos", produtoRoutes);
router.use("/compras", comprasRoutes);
router.use("/vendas", vendaRoutes);
router.use("/clientes", clientesRoutes);
router.use("/fornecedores", fornecedorRoutes);
router.use("/pessoas", pessoaRoutes);
router.use("/pessoas", pessoaRoutes);


export default router;
