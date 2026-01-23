// controllers/EstoqueController.js
import EstoqueRepository from "../repositories/EstoqueRepository.js";

class EstoqueController {
  // Verificar produtos com estoque baixo
  estoqueBaixo(req, res) {
    const { limite = 10 } = req.query;

    EstoqueRepository.verificarEstoqueBaixo(limite)
      .then(produtos => {
        if (produtos.length === 0) { 
          return res.status(200).json({ 
            message: "Nenhum produto com estoque baixo",
            dados: []
          });
        }
        res.status(200).json({
          message: `${produtos.length} produto(s) com estoque baixo`,
          limite: parseInt(limite),
          dados: produtos
        });
      })
      .catch(error => {
        console.error("Erro ao verificar estoque baixo:", error);
        res.status(500).json({ error: error.message });
      });
  }

  // Listar todos os produtos
  listarProdutos(req, res) {
    EstoqueRepository.listarTodos()
      .then(produtos => res.status(200).json(produtos))
      .catch(error => {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ error: error.message });
      });
  }

  // Visualizar histórico de movimentação
  historico(req, res) {
    const { produtoId } = req.params;

    EstoqueRepository.movimentacoes(produtoId)
      .then(movimentacoes => {
        if (movimentacoes.length === 0) {
          return res.status(404).json({ 
            message: "Nenhuma movimentação encontrada para este produto"
          });
        }
        res.status(200).json({
          produtoId,
          totalMovimentacoes: movimentacoes.length,
          movimentacoes
        });
      })
      .catch(error => {
        console.error("Erro ao buscar histórico:", error);
        res.status(500).json({ error: error.message });
      });
  }
}

export default new EstoqueController();
