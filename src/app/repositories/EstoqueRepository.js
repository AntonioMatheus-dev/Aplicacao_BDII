// repositories/EstoqueRepository.js
import { consulta } from "../database/conexao.js";

class EstoqueRepository {


  verificarEstoqueBaixo(limite = 10) {
    const sql = "SELECT * FROM verificar_estoque_baixo($1);";
    return consulta(sql, [limite], "Erro ao verificar estoque baixo");
  }

  listarTodos() {
    const sql = `
      SELECT ProdutoID, NomeProduto, Categoria, PrecoVenda, 
             Estoque, PrecoCusto, DataCadastro
      FROM Produtos
      ORDER BY NomeProduto;
    `;
    return consulta(sql, []);
  }

  movimentacoes(produtoId) {
    const sql = `
      SELECT m.mov_id, m.produto_id, m.tipo, m.quantidade, 
             m.documento_referencia, m.data_movimentacao,
             p.NomeProduto, pb.NomeRazaoSocial
      FROM MovimentacaoEstoque m
      JOIN Produtos p ON m.produto_id = p.ProdutoID
      JOIN PessoaBase pb ON m.pessoa_id = pb.PessoaID
      WHERE m.produto_id = $1
      ORDER BY m.data_movimentacao DESC;
    `;
    return consulta(sql, [produtoId]);
  }
}

export default new EstoqueRepository();
