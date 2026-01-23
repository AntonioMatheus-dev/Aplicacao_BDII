// controllers/ProdutoController.js
import ProdutoRepository from "../repositories/ProdutoRepository.js";

class ProdutoController {
  index(req, res) {
    ProdutoRepository.findAll()
      .then(rows => res.json(rows))
      .catch(error => res.status(500).json({ error: error }));
  }

  show(req, res) {
    const { id } = req.params;
    ProdutoRepository.findById(id)
      .then(row => res.json(row))
      .catch(error => res.status(500).json({ error: error }));
  }

  
  store(req, res) {
    const { nomeProduto, categoria, precoVenda, estoque, precoCusto } = req.body;
    const params = [nomeProduto, categoria, precoVenda, estoque, precoCusto];
    ProdutoRepository.create(params)
      .then(result => res.json({ message: "Produto criado com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  update(req, res) {
    const { id } = req.params;
    const { nomeProduto, categoria, precoVenda, precoCusto } = req.body;
    const params = [nomeProduto, categoria, precoVenda, precoCusto, id];
    ProdutoRepository.update(params)
      .then(result => res.json({ message: "Produto atualizado com sucesso", data: result }))
      .catch(error => res.status(500).json({ error: error }));
  }

  delete(req, res) {
    const { id } = req.params;
    ProdutoRepository.delete(id)
      .then(() => res.json({ message: "Produto deletado com sucesso" }))
      .catch(error => res.status(500).json({ error: error }));
  }

  estoqueBaixo(req, res) {
    const limite = parseInt(req.query.limite) || 10;
    ProdutoRepository.verificarEstoqueBaixo(limite)
      .then(rows => res.json(rows))
      .catch(error => res.status(500).json({ error: error }));
  }
}

export default new ProdutoController();

