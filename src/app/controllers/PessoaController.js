// controllers/PessoaController.js
import PessoaRepository from "../repositories/PessoaRepository.js";

class PessoaController {
  index(req, res) {
    PessoaRepository.findAll()
      .then(rows => res.json(rows))
      .catch(error => res.status(500).json({ error: error }));
  }

  show(req, res) {
    const { id } = req.params;
    PessoaRepository.findById(id)
      .then(row => res.json(row))
      .catch(error => res.status(500).json({ error: error }));
  }
  

  store(req, res) {
    const data = req.body;
    PessoaRepository.store(data)
      .then(result => res.json({ message: "Pessoa criada com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  update(req, res) {
    const { id } = req.params;
    const data = req.body;
    PessoaRepository.update(id, data)
      .then(result => res.json({ message: "Pessoa atualizada com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  delete(req, res) {
    const { id } = req.params;
    PessoaRepository.delete(id)
      .then(() => res.json({ message: "Pessoa deletada com sucesso" }))
      .catch(error => res.status(500).json({ error: error }));
  }
}

export default new PessoaController();
