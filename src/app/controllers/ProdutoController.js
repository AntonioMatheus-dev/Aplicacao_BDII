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

  historico(req, res) {
    const { id } = req.params;
    ProdutoRepository.movimentacoes(id)
      .then(movimentacoes => {
        if (movimentacoes.length === 0) {
          return res.status(404).json({ 
            message: "Nenhuma movimentação encontrada para este produto"
          });
        }
        res.status(200).json({
          produtoId: id,
          totalMovimentacoes: movimentacoes.length,
          movimentacoes
        });
      })
      .catch(error => {
        console.error("Erro ao buscar histórico:", error);
        res.status(500).json({ error: error.message });
      });
  }

  movimentacoesGerais(req, res) {
    const limit = parseInt(req.query.limit) || 100;
    ProdutoRepository.findAllMovimentacoes(limit)
      .then(rows => res.json(rows))
      .catch(error => {
        console.error("Erro ao buscar movimentações:", error);
        res.status(500).json({ error: error.message });
      });
  }
}

export default new ProdutoController();

