import { consulta } from "../database/conexao.js";

class ProdutoRepository {
  create(params) {
    const sql = `
      INSERT INTO Produtos (NomeProduto, Categoria, PrecoVenda, Estoque, PrecoCusto)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    return consulta(sql, params, "Não foi possível cadastrar produto");
  }

  findAll() {
    const sql = "SELECT * FROM Produtos ORDER BY NomeProduto;";
    return consulta(sql, [], "Não foi possível listar produtos");
  }

  findById(id) {
    const sql = "SELECT * FROM Produtos WHERE ProdutoID = $1;";
    return consulta(sql, [id], "Produto não encontrado");
  }

  update(params) {
    const sql = `
      UPDATE Produtos 
      SET NomeProduto = $1, Categoria = $2, PrecoVenda = $3, PrecoCusto = $4
      WHERE ProdutoID = $5
      RETURNING *;
    `;
    return consulta(sql, params, "Não foi possível atualizar produto");
  }

  delete(id) {
    const sql = "DELETE FROM Produtos WHERE ProdutoID = $1;";
    return consulta(sql, [id], "Não foi possível apagar produto");
  }

  //FUNCTION
  verificarEstoqueBaixo(limite) {
    const sql = "SELECT * FROM verificar_estoque_baixo($1);";
    return consulta(sql, [limite], "Erro ao verificar estoque");
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

  findAllMovimentacoes(limit = 100) {
    const sql = `
      SELECT m.mov_id, m.produto_id, m.tipo, m.quantidade, 
             m.documento_referencia, m.data_movimentacao,
             p.NomeProduto, pb.NomeRazaoSocial
      FROM MovimentacaoEstoque m
      JOIN Produtos p ON m.produto_id = p.ProdutoID
      JOIN PessoaBase pb ON m.pessoa_id = pb.PessoaID
      ORDER BY m.data_movimentacao DESC
      LIMIT $1;
    `;
    return consulta(sql, [limit]);
  }
}

export default new ProdutoRepository();
