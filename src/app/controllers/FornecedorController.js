// controllers/FornecedorController.js
import FornecedorRepository from "../repositories/FornecedorRepository.js";

class FornecedorController {
  index(req, res) {
    FornecedorRepository.findAll()
      .then(rows => res.json(rows))
      .catch(error => res.status(500).json({ error: error }));
  }

  show(req, res) {
    const { id } = req.params;
    FornecedorRepository.findById(id)
      .then(row => res.json(row))
      .catch(error => res.status(500).json({ error: error }));
  }

  store(req, res) {
    const data = req.body;
    FornecedorRepository.store(data)
      .then(result => res.json({ message: "Fornecedor criado com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  update(req, res) {
    const { id } = req.params;
    const data = req.body;
    FornecedorRepository.update(id, data)
      .then(result => res.json({ message: "Fornecedor atualizado com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  delete(req, res) {
    const { id } = req.params;
    FornecedorRepository.delete(id)
      .then(() => res.json({ message: "Fornecedor deletado com sucesso" }))
      .catch(error => res.status(500).json({ error: error }));
  }
}

export default new FornecedorController();
