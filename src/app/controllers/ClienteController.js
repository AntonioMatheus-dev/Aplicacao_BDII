//Controllers/ClienteController.js
import ClienteRepository from "../repositories/ClienteRepository.js";

class ClienteController {
  index(req, res) {
    ClienteRepository.findAll()
      .then(rows => res.json(rows))
      .catch(error => res.status(500).json({ error: error }));
  }

  
  show(req, res) {
    const { id } = req.params;
    ClienteRepository.findById(id)
      .then(row => res.json(row))
      .catch(error => res.status(500).json({ error: error }));
  }

  store(req, res) {
    const data = req.body;
    ClienteRepository.store(data)
      .then(result => res.json({ message: "Cliente criado com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  update(req, res) {
    const { id } = req.params;
    const data = req.body;
    ClienteRepository.update(id, data)
      .then(result => res.json({ message: "Cliente atualizado com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  delete(req, res) {
    const { id } = req.params;
    ClienteRepository.delete(id)
      .then(() => res.json({ message: "Cliente deletado com sucesso" }))
      .catch(error => res.status(500).json({ error: error }));
  }
}

export default new ClienteController();
