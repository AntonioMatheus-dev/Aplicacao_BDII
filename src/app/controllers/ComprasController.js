import CompraRepository from "../repositories/CompraRepository.js";

class ComprasController {
  // Listar todas as compras
  index(req, res) {
    CompraRepository.findAll()
      .then(rows => res.status(200).json(rows))
      .catch(error => {
        console.error("Erro ao listar compras:", error);
        res.status(500).json({ error: error.message });
      });
  }

  // Buscar compra por ID
  show(req, res) {
    const { id } = req.params;
    CompraRepository.findById(id)
      .then(row => {
        if (!row || row.length === 0) {
          return res.status(404).json({ error: "Compra não encontrada" });
        }
        res.status(200).json(row[0]);
      })
      .catch(error => {
        console.error("Erro ao buscar compra:", error);
        res.status(500).json({ error: error.message });
      });
  }

  store(req, res) {
    const { produtoId, fornecedorId, quantidade, precoUnitario } = req.body;
    if (!produtoId || !fornecedorId || !quantidade || !precoUnitario) {
      return res.status(400).json({ 
        error: "produtoId, fornecedorId, quantidade e precoUnitario são obrigatórios" 
      });
    }

    CompraRepository.registrar(produtoId, fornecedorId, quantidade, precoUnitario)
      .then(() => res.status(201).json({ 
        message: "Compra registrada com sucesso e estoque atualizado",
        dados: { produtoId, fornecedorId, quantidade, precoUnitario }
      }))
      .catch(error => {
        console.error("Erro ao registrar compra:", error);
        res.status(500).json({ error: error.message });
      });
  }

  delete(req, res) {
    const { id } = req.params;
    CompraRepository.delete(id)
      .then(() => res.json({ message: "Compra deletada e estoque estornado" }))
      .catch(error => res.status(500).json({ error: error.message }));
  }

  update(req, res) {
    const { id } = req.params;
    const data = req.body;
    CompraRepository.update(id, data)
        .then(() => res.json({ message: "Compra atualizada" }))
        .catch(error => res.status(500).json({ error: error.message }));
  }
}

export default new ComprasController();
