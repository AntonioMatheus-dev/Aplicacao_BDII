import VendaRepository from "../repositories/VendaRepository.js";

class VendasController {
  index(req, res) {
    VendaRepository.findAll()
      .then(rows => res.status(200).json(rows))
      .catch(error => {
        console.error("Erro ao listar vendas:", error);
        res.status(500).json({ error: error.message });
      });
  }

  
  show(req, res) {
    const { id } = req.params;
    VendaRepository.findById(id)
      .then(row => {
        if (!row || row.length === 0) {
          return res.status(404).json({ error: "Venda não encontrada" });
        }
        res.status(200).json(row[0]);
      })
      .catch(error => {
        console.error("Erro ao buscar venda:", error);
        res.status(500).json({ error: error.message });
      });
  }

  store(req, res) {
    const { produtoId, clienteId, quantidade, precoUnitario } = req.body;


    if (!produtoId || !clienteId || !quantidade || !precoUnitario) {
      return res.status(400).json({ 
        error: "produtoId, clienteId, quantidade e precoUnitario são obrigatórios" 
      });
    }

    VendaRepository.registrar(produtoId, clienteId, quantidade, precoUnitario)
      .then(() => res.status(201).json({ 
        message: "Venda registrada com sucesso e estoque atualizado",
        dados: { produtoId, clienteId, quantidade, precoUnitario }
      }))
      .catch(error => {
        console.error("Erro ao registrar venda:", error);
        // Extrair mensagem do erro corretamente
        const errorMessage = error.message || error.toString() || 'Erro desconhecido';
        res.status(500).json({ error: errorMessage });
      });
  }

  delete(req, res) {
    const { id } = req.params;
    VendaRepository.delete(id)
      .then(() => res.json({ message: "Venda deletada e estoque estornado" }))
      .catch(error => res.status(500).json({ error: error.message }));
  }

  update(req, res) {
    const { id } = req.params;
    const data = req.body;
    VendaRepository.update(id, data)
      .then(() => res.json({ message: "Venda atualizada" }))
      .catch(error => res.status(500).json({ error: error.message }));
  }
}

export default new VendasController();
